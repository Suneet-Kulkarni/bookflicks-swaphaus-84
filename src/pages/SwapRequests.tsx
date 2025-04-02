
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Book, SwapRequest, bookService } from "@/utils/bookService";
import { authService } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, PackageCheck, PackageX, ArrowRight } from "lucide-react";

const SwapRequests = () => {
  const [sentRequests, setSentRequests] = useState<{request: SwapRequest, book: Book | null}[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<{request: SwapRequest, book: Book}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Handle swap request status update
  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await bookService.updateSwapRequestStatus(requestId, status);
      setReceivedRequests(
        receivedRequests.map(item => 
          item.request.id === requestId 
            ? { ...item, request: { ...item.request, status } } 
            : item
        )
      );
      
      toast(
        status === 'accepted' 
          ? "Swap request accepted! The requester will contact you soon."
          : "Swap request rejected."
      );
    } catch (error) {
      console.error("Error updating swap request:", error);
      toast.error("Failed to update swap request status");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    const fetchSwapRequests = async () => {
      try {
        setIsLoading(true);
        
        // Fetch sent requests
        const myRequests = await bookService.getMySwapRequests();
        const sentWithBooks = await Promise.all(
          myRequests.map(async (request) => {
            const book = await bookService.getBookById(request.bookId);
            return { request, book };
          })
        );
        setSentRequests(sentWithBooks);
        
        // Fetch received requests
        const receivedWithBooks = await bookService.getIncomingSwapRequests();
        setReceivedRequests(receivedWithBooks);
      } catch (error) {
        console.error("Error fetching swap requests:", error);
        toast.error("Failed to load swap requests");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSwapRequests();
  }, [navigate]);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero section */}
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center page-transition">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-bookswap-navy">
              Swap Requests
            </h1>
            <p className="text-lg text-bookswap-navy/70 max-w-3xl mx-auto mb-6">
              Manage your incoming and outgoing book swap requests.
            </p>
          </div>
        </div>
      </section>
      
      {/* Tabs for requests */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="sent" className="glass rounded-2xl p-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="sent">Requests You've Sent</TabsTrigger>
              <TabsTrigger value="received">Requests You've Received</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-bookswap-teal animate-spin mb-4" />
                <p className="text-bookswap-navy">Loading swap requests...</p>
              </div>
            ) : (
              <>
                {/* Sent Requests Tab */}
                <TabsContent value="sent">
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <PackageCheck className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-bookswap-navy mb-2">No sent requests</h3>
                      <p className="text-bookswap-navy/70 mb-6">
                        You haven't requested any books for swapping yet.
                      </p>
                      <Button 
                        onClick={() => navigate("/welcome")}
                        className="bg-bookswap-teal hover:bg-bookswap-teal/80"
                      >
                        Browse Books
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Book Title</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sentRequests.map(({ request, book }) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {book?.title || 'Book no longer available'}
                              </TableCell>
                              <TableCell>{book?.ownerName || 'Unknown'}</TableCell>
                              <TableCell>
                                {new Date(request.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => book && navigate(`/book/${book.id}`)}
                                  disabled={!book}
                                >
                                  View Book
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
                
                {/* Received Requests Tab */}
                <TabsContent value="received">
                  {receivedRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <PackageX className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-bookswap-navy mb-2">No received requests</h3>
                      <p className="text-bookswap-navy/70 mb-6">
                        You haven't received any swap requests for your books yet.
                      </p>
                      <Button 
                        onClick={() => navigate("/add-book")}
                        className="bg-bookswap-teal hover:bg-bookswap-teal/80"
                      >
                        Add a Book
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Book Title</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receivedRequests.map(({ request, book }) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {book.title}
                              </TableCell>
                              <TableCell>User ID: {request.userId}</TableCell>
                              <TableCell>
                                {new Date(request.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {request.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleUpdateStatus(request.id, 'accepted')}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/book/${book.id}`)}
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default SwapRequests;
