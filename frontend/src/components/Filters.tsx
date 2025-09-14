interface FiltersProps {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  includeRookies: boolean
  searchQuery: string
  onSortByChange: (sortBy: string) => void
  onSortOrderChange: (order: 'asc' | 'desc') => void
  onIncludeRookiesChange: (include: boolean) => void
  onSearchQueryChange: (query: string) => void
}

const SORT_OPTIONS = [
  { value: 'draftScore', label: 'Draft Score' },
  { value: 'ppg', label: 'Points Per Game' },
  { value: 'ppt', label: 'Points Per Touch' },
  { value: 'vorp', label: 'VORP' },
  { value: 'name', label: 'Name' },
]

export default function Filters({
  sortBy,
  sortOrder,
  includeRookies,
  searchQuery,
  onSortByChange,
  onSortOrderChange,
  onIncludeRookiesChange,
  onSearchQueryChange,
}: FiltersProps) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Search</h3>
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Sort By</h3>
        <div className="space-y-3">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onSortOrderChange('desc')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortOrder === 'desc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Desc
            </button>
            <button
              onClick={() => onSortOrderChange('asc')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortOrder === 'asc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Asc
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeRookies}
            onChange={(e) => onIncludeRookiesChange(e.target.checked)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Include Rookies</span>
        </label>
      </div>
    </div>
  )
}
