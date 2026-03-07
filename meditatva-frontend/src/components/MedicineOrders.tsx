import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ShoppingCart, Package, Truck, CheckCircle, 
  MapPin, Clock, CreditCard,
  Eye, X, RotateCcw, Phone, Store, Calendar, FileText, Download
} from "lucide-react";
import { toast } from "sonner";
import { useOrders, Order } from "@/contexts/OrderContext";

export const MedicineOrders = () => {
  const { state, cancelOrder, reorder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders = state.orders.filter(order => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return ["pending", "confirmed", "processing", "dispatched"].includes(order.status);
    if (filterStatus === "delivered") return order.status === "delivered";
    return true;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "confirmed": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "processing": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "dispatched": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "delivered": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "dispatched": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medicine Orders</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Track your medicine orders and deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "delivered" ? "default" : "outline"}
            onClick={() => setFilterStatus("delivered")}
            size="sm"
          >
            Delivered
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20 dark:bg-purple-500/30">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.orders.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/20 dark:bg-blue-500/30">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.orders.filter(o => ["pending", "confirmed"].includes(o.status)).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-500/20 dark:bg-indigo-500/30">
              <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.orders.filter(o => ["processing", "dispatched"].includes(o.status)).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">In Transit</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20 dark:bg-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.orders.filter(o => o.status === "delivered").length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Delivered</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start by finding medicines and placing your first order
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-blue-500/20 dark:from-teal-500/30 dark:to-blue-500/30">
                          <ShoppingCart className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 dark:text-white font-semibold">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{order.pharmacy.name}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {order.medicines.map((medicine, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{medicine.name}</p>
                              {medicine.dosage && (
                                <p className="text-xs text-gray-600 dark:text-gray-300">{medicine.dosage}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Qty: {medicine.quantity}</p>
                            <p className="font-semibold text-teal-600 dark:text-teal-300">₹{medicine.price * medicine.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-300">₹{order.totalAmount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            className="gap-2 text-red-600 dark:text-red-400"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Button
                            size="sm"
                            onClick={() => reorder(order.id)}
                            className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Card className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 border-teal-200 dark:border-teal-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Order Number</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</p>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize ml-1">{selectedOrder.status}</span>
                    </Badge>
                  </div>
                </Card>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Store className="w-5 h-5" />
                    {selectedOrder.pharmacy.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.pharmacy.address}</p>
                  <p className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4" />
                    {selectedOrder.pharmacy.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Medicines</h3>
                  {selectedOrder.medicines.map((medicine, idx) => (
                    <div key={idx} className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{medicine.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Qty: {medicine.quantity}</p>
                      </div>
                      <p className="font-bold text-teal-600 dark:text-teal-300">₹{medicine.price * medicine.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Prescription Section - More Prominent */}
                {selectedOrder.prescriptionUrl && (
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-300 dark:border-blue-600">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Prescription Uploaded</h3>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Your prescription has been securely uploaded and is available for download.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            try {
                              if (selectedOrder.prescriptionUrl) {
                                // Create a blob from base64 data
                                const base64Data = selectedOrder.prescriptionUrl.split(',')[1];
                                const mimeType = selectedOrder.prescriptionUrl.split(':')[1].split(';')[0];
                                
                                // Convert base64 to blob
                                const byteCharacters = atob(base64Data);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: mimeType });
                                
                                // Create object URL and open in new tab
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                                
                                // Clean up after a delay
                                setTimeout(() => URL.revokeObjectURL(url), 100);
                                
                                toast.success('Opening prescription in new tab...');
                              }
                            } catch (error) {
                              console.error('Error viewing prescription:', error);
                              toast.error('Failed to open prescription. Try downloading instead.');
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          onClick={() => {
                            try {
                              if (selectedOrder.prescriptionUrl) {
                                // Create a blob from base64 data
                                const base64Data = selectedOrder.prescriptionUrl.split(',')[1];
                                const mimeType = selectedOrder.prescriptionUrl.split(':')[1].split(';')[0];
                                
                                // Determine file extension
                                let extension = 'pdf';
                                if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
                                else if (mimeType.includes('png')) extension = 'png';
                                
                                // Convert base64 to blob
                                const byteCharacters = atob(base64Data);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: mimeType });
                                
                                // Create download link
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `Prescription_${selectedOrder.orderNumber}.${extension}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                                
                                toast.success('Prescription downloaded successfully!');
                              }
                            } catch (error) {
                              console.error('Error downloading prescription:', error);
                              toast.error('Failed to download prescription. Please try again.');
                            }
                          }}
                          variant="outline"
                          className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Delivery Method */}
                {selectedOrder.deliveryMethod && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Method</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedOrder.deliveryMethod}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {selectedOrder.customerNotes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Notes</p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white">{selectedOrder.customerNotes}</p>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                  </div>
                  {selectedOrder.platformCharge && selectedOrder.platformCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Platform Charge (2%):</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{selectedOrder.platformCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.deliveryCharge && selectedOrder.deliveryCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Delivery Charge:</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white">Total Amount:</span>
                    <span className="text-teal-600 dark:text-teal-300">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};
