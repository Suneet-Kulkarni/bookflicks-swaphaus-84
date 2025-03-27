
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, SwapRequest, bookService } from "@/utils/bookService";
import { authService } from "@/utils/authService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Clock, Loader2, BookOpenText } from "lucide-react";
import { toast } from "sonner";

interface SwapRequestItemProps {
  request: SwapRequest;
  book: Book;
  onStatusUpdate?: (requestId: string, status: 'accepted' | 'rejected') => void;
  isIncoming?: boolean;
}

const SwapRequestItem: React.FC<SwapRequestItemProps> = ({ request, book, onStatusUpdate, isIncoming = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    if (!onStatusUpdate) return;
    
    setIsLoading(true);
    try {
      await bookService.updateSwapRequestStatus(request.id, status);
      onStatusUpdate(request.id, status);
    } catch (error: any) {
      toast(error.message || "Failed to update request");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 glass rounded-xl animate-fade-in-up">
      <div className="sm:w-1/4 md:w-1/5">
        <div className="aspect-[2/3] rounded-lg overflow-hidden">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="font-serif font-medium text-lg">{book.title}</h3>
          
          <div className="flex items-center space-x-2">
            {request.status === 'pending' && (
              <span className="inline-flex items-center text-sm px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </span>
            )}
            {request.status === 'accepted' && (
              <span className="inline-flex items-center text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Accepted
              </span>
            )}
            {request.status === 'rejected' && (
              <span className="inline-flex items-center text-sm px-2 py-1 rounded-full bg-red-100 text-red-700">
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-bookswap-navy/70 mb-1">by {book.author}</p>
        <p className="text-xs text-bookswap-navy/60 mb-3">Condition: {book.condition}</p>
        
        <div className="mt-auto">
          {isIncoming ? (
            <p className="text-sm mb-2">
              <span className="text-bookswap-navy/70">Request from: </span>
              <span className="font-medium">{request.requesterName}</span> on {formatDate(request.createdAt)}
            </p>
          ) : (
            <p className="text-sm mb-2">
              <span className="text-bookswap-navy/70">Owned by: </span>
              <span className="font-medium">{book.ownerName}</span>
            </p>
          )}
          
          {isIncoming && request.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => handleUpdateStatus('rejected')}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                Decline
              </Button>
              
              <Button
                size="sm"
                className="bg-bookswap-teal hover:bg-bookswap-teal/80"
                onClick={() => handleUpdateStatus('accepted')}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                Accept
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SwapRequests = () => {
  const [outgoingRequests, setOutgoingRequests] = useState<{request: SwapRequest, book: Book}[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<{request: SwapRequest, book: Book}[]>([]);
  const [isLoadingOutgoing, setIsLoadingOutgoing] = useState(true);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(true);
  const [activeTab, setActiveTab] = useState("outgoing");
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch swap requests
  useEffect(() => {
    const fetchOutgoingRequests = async () => {
      try {
        setIsLoadingOutgoing(true);
        const data = await bookService.getMySwapRequests();
        setOutgoingRequests(data);
      } catch (error) {
        console.error("Error fetching outgoing requests:", error);
      } finally {
        setIsLoadingOutgoing(false);
      }
    };

    const fetchIncomingRequests = async () => {
      try {
        setIsLoadingIncoming(true);
        const data = await bookService.getIncomingSwapRequests();
        setIncomingRequests(data);
      } catch (error) {
        console.error("Error fetching incoming requests:", error);
      } finally {
        setIsLoadingIncoming(false);
      }
    };

    fetchOutgoingRequests();
    fetchIncomingRequests();
  }, []);

  // Handle status update
  const handleStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setIncomingRequests(incomingRequests.map(item => {
      if (item.request.id === requestId) {
        return {
          ...item,
          request: {
            ...item.request,
            status
          }
        };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-purple-50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/welcome")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
          
          <div className="text-center page-transition">
            <div className="inline-block bg-bookswap-teal/10 px-4 py-2 rounded-full text-bookswap-teal font-medium mb-4">
              My Swaps
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-bookswap-navy">
              Book Swap Requests
            </h1>
            <p className="text-lg text-bookswap-navy/70 max-w-3xl mx-auto">
              Manage your incoming and outgoing book swap requests.
            </p>
          </div>
        </div>
      </section>
      
      {/* Tabs for requests */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="outgoing" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="outgoing" className="text-base">
                My Requests
                {outgoingRequests.length > 0 && (
                  <span className="ml-2 bg-bookswap-teal/10 text-bookswap-teal text-xs px-2 py-0.5 rounded-full">
                    {outgoingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="incoming" className="text-base">
                Incoming Requests
                {incomingRequests.length > 0 && (
                  <span className="ml-2 bg-bookswap-coral/10 text-bookswap-coral text-xs px-2 py-0.5 rounded-full">
                    {incomingRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="outgoing" className="min-h-[300px]">
              {isLoadingOutgoing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 text-bookswap-teal animate-spin mb-4" />
                  <p className="text-bookswap-navy">Loading your requests...</p>
                </div>
              ) : outgoingRequests.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <BookOpenText className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-bookswap-navy mb-2">No outgoing requests</h3>
                  <p className="text-bookswap-navy/70 mb-6">
                    You haven't requested any book swaps yet.
                  </p>
                  <Button 
                    onClick={() => navigate("/welcome")}
                    className="bg-bookswap-teal hover:bg-bookswap-teal/80"
                  >
                    Browse Books
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {outgoingRequests.map((item, index) => (
                    <SwapRequestItem 
                      key={item.request.id}
                      request={item.request}
                      book={item.book}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="incoming" className="min-h-[300px]">
              {isLoadingIncoming ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 text-bookswap-coral animate-spin mb-4" />
                  <p className="text-bookswap-navy">Loading incoming requests...</p>
                </div>
              ) : incomingRequests.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <BookOpenText className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-bookswap-navy mb-2">No incoming requests</h3>
                  <p className="text-bookswap-navy/70 mb-6">
                    You don't have any swap requests for your books yet.
                  </p>
                  <Button 
                    onClick={() => navigate("/add-book")}
                    className="bg-bookswap-coral hover:bg-bookswap-coral/80"
                  >
                    Add More Books
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((item, index) => (
                    <SwapRequestItem 
                      key={item.request.id}
                      request={item.request}
                      book={item.book}
                      onStatusUpdate={handleStatusUpdate}
                      isIncoming
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default SwapRequests;
