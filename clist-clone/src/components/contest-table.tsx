import { useState, useEffect } from 'react';
import { StarIcon } from '@/components/star-icon';

// Updated Contest type to match new data structure
interface Platform {
  _id: string;
  name: string;
  url: string;
  logoUrl?: string;
}

interface Contest {
  _id: string;
  platform: Platform;
  startDate: string;
  name: string;
  endDate: string;
  status: string;
  url: string;
  solution?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PaginationData {
  total: number;
  page: number;
  pages: number;
}

type SortField = 'startDate' | 'endDate' | 'name';
type SortDirection = 'asc' | 'desc';

export function ContestTable() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [paginationData, setPaginationData] = useState<PaginationData>({
    total: 0,
    page: 1,
    pages: 1
  });
  
  // Filter state (optional)
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setIsLoading(true);
        
        // Build query params for API request
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', itemsPerPage.toString());
        
        // Add sort parameters to the API request
        queryParams.append('sort', sortField);
        queryParams.append('order', sortDirection);
        
        if (statusFilter) queryParams.append('status', statusFilter);
        if (platformFilter) queryParams.append('platform', platformFilter);
        
        // Make the API request with query params
        const response = await fetch(`http://localhost:3000/api/contests?${queryParams.toString()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch contests');
        }
        
        // Extract contests and pagination data from the response
        const contestsArray = data.contests || [];
        
        // Apply client-side sorting as a fallback if server doesn't support it
        const sortedContests = sortContestsArray(contestsArray, sortField, sortDirection);
        
        setContests(sortedContests);
        setPaginationData(data.pagination || {
          total: contestsArray.length,
          page: currentPage,
          pages: Math.ceil(contestsArray.length / itemsPerPage)
        });
      } catch (err) {
        console.error('Error fetching contests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contests data');
      } finally {
        setIsLoading(false);
      }
    };

    // Call the async function
    fetchContests();
  }, [currentPage, itemsPerPage, statusFilter, platformFilter, sortField, sortDirection]);

  // Sort function moved outside to avoid recreating on each render
  const sortContestsArray = (contestsToSort: Contest[], field: SortField, direction: SortDirection) => {
    return [...contestsToSort].sort((a, b) => {
      if (field === 'name') {
        // For names, we use localeCompare for alphabetical sorting
        return direction === 'desc' 
          ? b.name.localeCompare(a.name) // Descending: Z to A
          : a.name.localeCompare(b.name); // Ascending: A to Z
      } else {
        // For dates, we compare timestamps
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        return direction === 'desc' 
          ? dateB - dateA // Descending: newest first
          : dateA - dateB; // Ascending: oldest first
      }
    });
  };

  // Toggle sort direction and field
  const handleSort = (field: SortField) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Function to format the time
  const formatStartTime = (startDate: string) => {
    const date = new Date(startDate);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to calculate time remaining
  const calculateTimeRemaining = (endDate: string, status: string) => {
    if (status === 'finished') return 'over';
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'over';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} min`;
  };

  // Function to calculate duration
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Function to determine if a contest is active
  const isContestActive = (status: string, endDate: string) => {
    if (status === 'finished') return false;
    const now = new Date();
    const end = new Date(endDate);
    return now < end;
  };

  // Function to determine the background color for the row
  const getRowBgColor = (index: number, status: string, endDate: string) => {
    if (isContestActive(status, endDate)) return 'bg-blue-50';
    return index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  };

  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < paginationData.pages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Change items per page
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <p className="font-medium">Error loading contests</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!contests || contests.length === 0) {
    return (
      <div className="mt-6 p-4 border border-gray-300 bg-gray-50 rounded-md text-gray-600">
        No contests available.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('startDate')}
              >
                Start time
                <SortIndicator field="startDate" />
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ends in
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('name')}
              >
                Event
                <SortIndicator field="name" />
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200">
                Solutions
              </th>
              <th 
                className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
              >
                Platform
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contests.map((contest, index) => (
              <tr key={contest._id} className={getRowBgColor(index, contest.status, contest.endDate)}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                  {formatStartTime(contest.startDate)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                  {calculateTimeRemaining(contest.endDate, contest.status)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                  {calculateDuration(contest.startDate, contest.endDate)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <a href={contest.url} className="text-blue-600 hover:text-blue-800">
                      {contest.name}
                    </a>
                    <StarIcon className="ml-2 h-4 w-4 text-gray-400" />
                    {contest.status === 'active' && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 text-center">
                {contest.solution && (
                  <a href={contest.solution} className="hover:text-blue-600 inline-flex justify-center">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" 
                      alt="YouTube" 
                      width="24" 
                      className="mx-auto"
                    />
                  </a>
                )}
              </td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-600">
                {contest.platform && (
                  <a href={contest.platform.url} className="hover:text-blue-600">
                    {contest.platform.logoUrl && (
                      <img src={contest.platform.logoUrl} alt={`${contest.platform.name} logo`} width="100" />
                    )}
                    {/* {contest.platform.name} */}
                  </a>
                )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing page <span className="font-medium">{paginationData.page}</span> of{' '}
            <span className="font-medium">{paginationData.pages}</span> pages
            <span className="ml-1">({paginationData.total} total contests)</span>
          </span>
          <div className="ml-4">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-100'
            }`}
          >
            Previous
          </button>
          <div className="hidden sm:flex space-x-1">
            {Array.from({ length: Math.min(5, paginationData.pages) }, (_, i) => {
              // Logic to show pages around current page
              let pageNum;
              if (paginationData.pages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= paginationData.pages - 2) {
                pageNum = paginationData.pages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === paginationData.pages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === paginationData.pages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-100'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}