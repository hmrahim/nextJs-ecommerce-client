import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_COLORS } from '@/lib/constants';

const colorMap = {
  delivered: 'success', cancelled: 'danger', refunded: 'danger',
  pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info',
};

export default function StatusBadge({ status }) {
  return <Badge color={colorMap[status] || 'default'}>{status}</Badge>;
}
