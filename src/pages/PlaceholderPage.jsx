import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/vendors': 'Vendors',
  '/products/all': 'All Products',
  '/products/requests': 'Product Requests',
  '/products/tags': 'Tags',
  '/products/attributes': 'Attributes',
  '/products/reviews': 'Reviews',
  '/customers/all': 'All Customers',
  '/customers/support': 'Customer Support',
  '/orders': 'Orders',
  '/settings/profile': 'Profile Settings',
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const label = PAGE_LABELS[pathname] || pathname.split('/').pop();

  return (
    <div className="ph-page">
      <Construction />
      <h2>{label}</h2>
      <p>This page will be built in the next phase.</p>
    </div>
  );
}
