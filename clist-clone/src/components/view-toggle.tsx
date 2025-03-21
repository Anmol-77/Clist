type ViewToggleProps = {
  activeView: 'list' | 'calendar';
  onViewChange: (view: string) => void;
};

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2 border border-gray-300 rounded-md">
      <button
        className={`px-3 py-1 text-sm ${
          activeView === 'list'
            ? 'bg-gray-300 text-gray-800'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => onViewChange('list')}
      >
        List
      </button>
      <button
        className={`px-3 py-1 text-sm ${
          activeView === 'calendar'
            ? 'bg-gray-300 text-gray-800'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => onViewChange('calendar')}
      >
        Calendar
      </button>
    </div>
  );
}
