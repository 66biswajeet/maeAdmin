import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
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
} from "lucide-react";
import "./RichTextEditor.css";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "rte-paragraph",
          },
        },
        heading: {
          HTMLAttributes: {
            class: "rte-heading",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "rte-list",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "rte-list",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "rte-codeblock",
          },
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "rte-table",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "rte-table-row",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "rte-table-header",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "rte-table-cell",
        },
      }),
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      FontSize,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "rte-editor",
      },
    },
  });

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleStrikethrough = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const setFontSize = useCallback(
    (size) => {
      editor?.chain().focus().setFontSize(size).run();
    },
    [editor],
  );

  const setColor = useCallback(
    (color) => {
      editor?.chain().focus().setColor(color).run();
    },
    [editor],
  );

  const insertTable = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor?.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="rte-container">
      {/* Sticky Toolbar */}
      <div className="rte-toolbar">
        {/* Format Group */}
        <div className="rte-toolbar__group">
          <button
            onClick={toggleBold}
            className={`rte-toolbar__btn ${
              editor.isActive("bold") ? "active" : ""
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>

          <button
            onClick={toggleItalic}
            className={`rte-toolbar__btn ${
              editor.isActive("italic") ? "active" : ""
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>

          <button
            onClick={toggleUnderline}
            className={`rte-toolbar__btn ${
              editor.isActive("underline") ? "active" : ""
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </button>

          <button
            onClick={toggleStrikethrough}
            className={`rte-toolbar__btn ${
              editor.isActive("strike") ? "active" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </button>
        </div>

        {/* Font Size Dropdown */}
        <div className="rte-toolbar__group">
          <div className="rte-toolbar__dropdown-group">
            <Type size={18} className="rte-toolbar__dropdown-icon" />
            <select
              onChange={(e) => setFontSize(e.target.value)}
              className="rte-toolbar__dropdown"
              title="Font Size"
            >
              <option value="">Font Size</option>
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Color Picker */}
        <div className="rte-toolbar__group">
          <div className="rte-toolbar__color-picker">
            <Palette size={18} className="rte-toolbar__color-icon" />
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

        {/* Table Operations */}
        <div className="rte-toolbar__group">
          <button
            onClick={insertTable}
            className="rte-toolbar__btn"
            title="Insert Table"
          >
            <Grid3x3 size={18} />
          </button>

          <button
            onClick={deleteTable}
            className="rte-toolbar__btn"
            title="Delete Table"
          >
            <Trash size={18} />
          </button>
        </div>

        {/* Clear Formatting */}
        <div className="rte-toolbar__group">
          <button
            onClick={clearFormatting}
            className="rte-toolbar__btn"
            title="Clear All Formatting"
          >
            <Copy size={18} />
          </button>

          <button
            onClick={() => editor.chain().focus().clearContent().run()}
            className="rte-toolbar__btn"
            title="Clear All Content"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="rte-editor-wrapper">
        <EditorContent editor={editor} placeholder={placeholder} />
        {!value && (
          <div className="rte-placeholder">
            {placeholder ||
              "Start typing or paste your product specification table from Excel here..."}
          </div>
        )}
      </div>
    </div>
  );
}
