import L from 'leaflet';

export const createTaskMarker = (status: string) => {
  const colors = {
    open: '#10B981',      // green
    accepted: '#3B82F6',  // blue
    funded: '#8B5CF6',    // purple
    submitted: '#F59E0B', // yellow
    approved: '#6366F1',  // indigo
    paid: '#6B7280',      // gray
    cancelled: '#EF4444', // red
  };

  const color = colors[status as keyof typeof colors] || '#6B7280';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">
        $
      </div>
    `,
    className: 'custom-task-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};