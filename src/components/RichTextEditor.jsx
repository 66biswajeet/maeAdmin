import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import FontSize from "../extensions/FontSize";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Type,
  Palette,
  Grid3x3,
  Trash,
  Trash2,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { uploadToCloudinary } from "../services/cloudinaryService";
import "./RichTextEditor.css";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px", "48px"];
const PRESET_COLORS = [
  "#1d3a85", // Navy
  "#4cc9ca", // Teal
  "#000000", // Black
  "#666666", // Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#0891b2", // Cyan
  "#7c3aed", // Purple
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: { class: "rte-paragraph" },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: { class: "rte-heading" },
        },
        bulletList: {
          HTMLAttributes: { class: "rte-list" },
        },
        orderedList: {
          HTMLAttributes: { class: "rte-list" },
        },
        codeBlock: {
          HTMLAttributes: { class: "rte-codeblock" },
        },
        blockquote: {
          HTMLAttributes: { class: "rte-blockquote" },
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "rte-table" },
      }),
      TableRow.configure({ HTMLAttributes: { class: "rte-table-row" } }),
      TableHeader.configure({ HTMLAttributes: { class: "rte-table-header" } }),
      TableCell.configure({ HTMLAttributes: { class: "rte-table-cell" } }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      FontSize,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rte-image" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "rte-link", rel: "noopener noreferrer" },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: { class: "rte-editor" },
    },
  });

  /* ─── Formatting handlers ───────────────────────────────────────────── */
  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const toggleStrikethrough = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

  const setHeading = useCallback(
    (level) => editor?.chain().focus().toggleHeading({ level }).run(),
    [editor]
  );

  const setFontSize = useCallback(
    (size) => editor?.chain().focus().setFontSize(size).run(),
    [editor]
  );

  const setColor = useCallback(
    (color) => editor?.chain().focus().setColor(color).run(),
    [editor]
  );

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const deleteTable = useCallback(() => editor?.chain().focus().deleteTable().run(), [editor]);

  const clearFormatting = useCallback(
    () => editor?.chain().focus().clearNodes().unsetAllMarks().run(),
    [editor]
  );

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  /* ─── Cloudinary image upload ───────────────────────────────────────── */
  const [uploading, setUploading] = React.useState(false);

  const handleImageFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const result = await uploadToCloudinary(file, "pages");
        if (result?.url) {
          editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
        }
      } catch {
        // silent — user will see nothing inserted
      } finally {
        setUploading(false);
        // Reset input so the same file can be re-selected
        if (imageInputRef.current) imageInputRef.current.value = "";
      }
    },
    [editor]
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="rte-container">
      {/* ── Sticky Toolbar ── */}
      <div className="rte-toolbar">

        {/* Headings group */}
        <div className="rte-toolbar__group">
          <button
            onClick={() => setHeading(1)}
            className={`rte-toolbar__btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => setHeading(2)}
            className={`rte-toolbar__btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => setHeading(3)}
            className={`rte-toolbar__btn ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        {/* Format Group */}
        <div className="rte-toolbar__group">
          <button
            onClick={toggleBold}
            className={`rte-toolbar__btn ${editor.isActive("bold") ? "active" : ""}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={toggleItalic}
            className={`rte-toolbar__btn ${editor.isActive("italic") ? "active" : ""}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={toggleUnderline}
            className={`rte-toolbar__btn ${editor.isActive("underline") ? "active" : ""}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            onClick={toggleStrikethrough}
            className={`rte-toolbar__btn ${editor.isActive("strike") ? "active" : ""}`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
        </div>

        {/* Lists & Blockquote */}
        <div className="rte-toolbar__group">
          <button
            onClick={toggleBulletList}
            className={`rte-toolbar__btn ${editor.isActive("bulletList") ? "active" : ""}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={toggleOrderedList}
            className={`rte-toolbar__btn ${editor.isActive("orderedList") ? "active" : ""}`}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={toggleBlockquote}
            className={`rte-toolbar__btn ${editor.isActive("blockquote") ? "active" : ""}`}
            title="Blockquote"
          >
            <Quote size={16} />
          </button>
        </div>

        {/* Font Size Dropdown */}
        <div className="rte-toolbar__group">
          <div className="rte-toolbar__dropdown-group">
            <Type size={16} className="rte-toolbar__dropdown-icon" />
            <select
              onChange={(e) => setFontSize(e.target.value)}
              className="rte-toolbar__dropdown"
              title="Font Size"
            >
              <option value="">Size</option>
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Color Picker */}
        <div className="rte-toolbar__group">
          <div className="rte-toolbar__color-picker">
            <Palette size={16} className="rte-toolbar__color-icon" />
            <div className="rte-toolbar__color-grid">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setColor(color)}
                  className="rte-toolbar__color-swatch"
                  style={{ backgroundColor: color }}
                  title={`Set color to ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Image insert */}
        <div className="rte-toolbar__group">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="rte-toolbar__btn"
            title="Insert Image (uploads to Cloudinary)"
            disabled={uploading}
            style={{ opacity: uploading ? 0.6 : 1 }}
          >
            {uploading ? (
              <span style={{ fontSize: 11 }}>…</span>
            ) : (
              <ImageIcon size={16} />
            )}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageFileChange}
          />
        </div>

        {/* Link */}
        <div className="rte-toolbar__group">
          <button
            onClick={setLink}
            className={`rte-toolbar__btn ${editor.isActive("link") ? "active" : ""}`}
            title="Insert / Edit Link"
          >
            <LinkIcon size={16} />
          </button>
        </div>

        {/* Table Operations */}
        <div className="rte-toolbar__group">
          <button onClick={insertTable} className="rte-toolbar__btn" title="Insert Table">
            <Grid3x3 size={16} />
          </button>
          <button onClick={deleteTable} className="rte-toolbar__btn" title="Delete Table">
            <Trash size={16} />
          </button>
        </div>

        {/* Clear / Wipe */}
        <div className="rte-toolbar__group">
          <button onClick={clearFormatting} className="rte-toolbar__btn" title="Clear All Formatting">
            <Copy size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().clearContent().run()}
            className="rte-toolbar__btn"
            title="Clear All Content"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="rte-editor-wrapper">
        <EditorContent editor={editor} placeholder={placeholder} />
        {!value && (
          <div className="rte-placeholder">
            {placeholder || "Start writing your content here..."}
          </div>
        )}
      </div>
    </div>
  );
}
