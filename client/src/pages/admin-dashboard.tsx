import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  CalendarCheck, 
  Euro, 
  Users, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Edit, 
  Trash2, 
  Wrench,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Car as CarType, Reservation, User } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("fleet");
  const [fleetFilters, setFleetFilters] = useState({
    status: "",
    category: "",
    location: "",
  });
  const [bookingFilters, setBookingFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin data
  const { data: cars = [], isLoading: carsLoading } = useQuery<CarType[]>({
    queryKey: ["/api/cars"],
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["/api/locations"],
  });

  // Calculate admin stats
  const stats = {
    totalCars: cars.length,
    activeReservations: reservations.filter(r => r.status === "active" || r.status === "confirmed").length,
    monthlyRevenue: reservations
      .filter(r => r.status !== "cancelled")
      .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0),
    totalCustomers: 156, // Mock data as we don't have customer endpoint yet
  };

  // Car mutations
  const updateCarMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CarType> }) => {
      return apiRequest("PUT", `/api/cars/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Sukces",
        description: "Pojazd został zaktualizowany",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować pojazdu",
        variant: "destructive",
      });
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Sukces",
        description: "Pojazd został usunięty",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć pojazdu",
        variant: "destructive",
      });
    },
  });

  // Reservation mutations
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Reservation> }) => {
      return apiRequest("PUT", `/api/reservations/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: "Sukces",
        description: "Rezerwacja została zaktualizowana",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować rezerwacji",
        variant: "destructive",
      });
    },
  });

  // Filter functions
  const filteredCars = cars.filter((car) => {
    if (fleetFilters.status && car.status !== fleetFilters.status) return false;
    if (fleetFilters.category && car.category !== fleetFilters.category) return false;
    if (fleetFilters.location && car.location !== fleetFilters.location) return false;
    return true;
  });

  const filteredReservations = reservations.filter((reservation) => {
    if (bookingFilters.status && reservation.status !== bookingFilters.status) return false;
    if (bookingFilters.startDate && new Date(reservation.pickupDate) < new Date(bookingFilters.startDate)) return false;
    if (bookingFilters.endDate && new Date(reservation.returnDate) > new Date(bookingFilters.endDate)) return false;
    return true;
  });

  const handleCarStatusChange = (carId: number, newStatus: string) => {
    updateCarMutation.mutate({ id: carId, updates: { status: newStatus } });
  };

  const handleReservationStatusChange = (reservationId: number, newStatus: string) => {
    updateReservationMutation.mutate({ id: reservationId, updates: { status: newStatus } });
  };

  const getStatusBadge = (status: string, type: "car" | "reservation") => {
    const variants = {
      car: {
        available: { variant: "default" as const, className: "bg-green-100 text-green-800", label: "Dostępny" },
        rented: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800", label: "Wynajęty" },
        maintenance: { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800", label: "Serwis" },
      },
      reservation: {
        confirmed: { variant: "default" as const, className: "bg-green-100 text-green-800", label: "Potwierdzona" },
        active: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800", label: "W trakcie" },
        completed: { variant: "outline" as const, className: "bg-gray-100 text-gray-800", label: "Zakończona" },
        cancelled: { variant: "destructive" as const, className: "bg-red-100 text-red-800", label: "Anulowana" },
      },
    };

    const config = variants[type][status as keyof typeof variants[typeof type]];
    return (
      <Badge variant={config?.variant || "outline"} className={config?.className}>
        {config?.label || status}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Administratora</h1>
        <p className="text-gray-600">Zarządzaj flotą, rezerwacjami i raportami</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalCars}</div>
                <div className="text-sm text-gray-500">Pojazdy w flocie</div>
                <div className="text-xs text-green-600">+2 w tym miesiącu</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.activeReservations}</div>
                <div className="text-sm text-gray-500">Aktywne rezerwacje</div>
                <div className="text-xs text-green-600">
                  {Math.round((stats.activeReservations / stats.totalCars) * 100)}% wykorzystania
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Euro className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.monthlyRevenue.toLocaleString('pl-PL')}
                </div>
                <div className="text-sm text-gray-500">Przychód (zł)</div>
                <div className="text-xs text-green-600">+15% vs poprzedni miesiąc</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
                <div className="text-sm text-gray-500">Klienci</div>
                <div className="text-xs text-green-600">+8 nowych</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 px-6 pt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fleet">Zarządzanie flotą</TabsTrigger>
              <TabsTrigger value="bookings">Rezerwacje</TabsTrigger>
              <TabsTrigger value="customers">Klienci</TabsTrigger>
              <TabsTrigger value="reports">Raporty</TabsTrigger>
            </TabsList>
          </div>

          {/* Fleet Management Tab */}
          <TabsContent value="fleet" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Flota samochodów</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pojazd
              </Button>
            </div>

            {/* Fleet Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
                    <Select value={fleetFilters.status} onValueChange={(value) => setFleetFilters({...fleetFilters, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie</SelectItem>
                        <SelectItem value="available">Dostępne</SelectItem>
                        <SelectItem value="rented">Wynajęte</SelectItem>
                        <SelectItem value="maintenance">Serwis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Kategoria</Label>
                    <Select value={fleetFilters.category} onValueChange={(value) => setFleetFilters({...fleetFilters, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie</SelectItem>
                        <SelectItem value="economic">Ekonomiczna</SelectItem>
                        <SelectItem value="compact">Kompaktowa</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Lokalizacja</Label>
                    <Select value={fleetFilters.location} onValueChange={(value) => setFleetFilters({...fleetFilters, location: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie</SelectItem>
                        {locations.map((location: any) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtruj
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fleet Table */}
            <div className="overflow-x-auto">
              {carsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                      <div className="w-12 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pojazd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokalizacja</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena/dzień</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ostatni serwis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCars.map((car) => (
                      <tr key={car.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={car.imageUrl || "/placeholder-car.jpg"} 
                              alt={`${car.make} ${car.model}`}
                              className="w-12 h-8 rounded object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{car.make} {car.model}</div>
                              <div className="text-sm text-gray-500">{car.plateNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{car.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(car.status, "car")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.pricePerDay} zł</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {car.lastServiceDate ? new Date(car.lastServiceDate).toLocaleDateString('pl-PL') : 'Brak danych'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {car.status === "available" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleCarStatusChange(car.id, "maintenance")}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          )}
                          {car.status === "maintenance" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleCarStatusChange(car.id, "available")}
                            >
                              <Car className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteCarMutation.mutate(car.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Rezerwacje</h3>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Eksport
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nowa rezerwacja
                </Button>
              </div>
            </div>

            {/* Booking Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
                    <Select value={bookingFilters.status} onValueChange={(value) => setBookingFilters({...bookingFilters, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie</SelectItem>
                        <SelectItem value="confirmed">Potwierdzone</SelectItem>
                        <SelectItem value="active">W trakcie</SelectItem>
                        <SelectItem value="completed">Zakończone</SelectItem>
                        <SelectItem value="cancelled">Anulowane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Data od</Label>
                    <Input 
                      type="date" 
                      value={bookingFilters.startDate}
                      onChange={(e) => setBookingFilters({...bookingFilters, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Data do</Label>
                    <Input 
                      type="date" 
                      value={bookingFilters.endDate}
                      onChange={(e) => setBookingFilters({...bookingFilters, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Klient</Label>
                    <Input 
                      placeholder="Szukaj klienta..."
                      value={bookingFilters.search}
                      onChange={(e) => setBookingFilters({...bookingFilters, search: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Szukaj
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              {reservationsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezerwacja</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pojazd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Okres</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wartość</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(reservation.createdAt!).toLocaleDateString('pl-PL')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Klient #{reservation.userId}</div>
                          <div className="text-sm text-gray-500">klient@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Pojazd #{reservation.carId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(reservation.pickupDate).toLocaleDateString('pl-PL')} - {new Date(reservation.returnDate).toLocaleDateString('pl-PL')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.ceil((new Date(reservation.returnDate).getTime() - new Date(reservation.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} dni
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reservation.status, "reservation")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.totalAmount} zł</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {reservation.status === "confirmed" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReservationStatusChange(reservation.id, "active")}
                            >
                              Start
                            </Button>
                          )}
                          {reservation.status === "active" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleReservationStatusChange(reservation.id, "completed")}
                            >
                              Zakończ
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Klienci</h3>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Eksport
                </Button>
                <Input placeholder="Szukaj klienta..." className="w-64" />
              </div>
            </div>

            {/* Mock Customer Data */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data rejestracji</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezerwacje</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Łączna wartość</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Jan Kowalski</div>
                          <div className="text-sm text-gray-500">jan.kowalski@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 Sty 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservations.filter(r => r.userId === 2).length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservations
                        .filter(r => r.userId === 2)
                        .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0)
                        .toLocaleString('pl-PL')} zł
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button size="sm" variant="outline">Profil</Button>
                      <Button size="sm" variant="outline">Historia</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Raporty i analityka</h3>
            
            {/* Report Period Selection */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Okres</Label>
                    <Select defaultValue="30days">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Ostatnie 7 dni</SelectItem>
                        <SelectItem value="30days">Ostatnie 30 dni</SelectItem>
                        <SelectItem value="3months">Ostatnie 3 miesiące</SelectItem>
                        <SelectItem value="year">Ostatni rok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Od</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">Do</Label>
                    <Input type="date" />
                  </div>
                  <div className="flex items-end">
                    <Button>Aktualizuj</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Przychód ogółem</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.monthlyRevenue.toLocaleString('pl-PL')} zł
                  </div>
                  <div className="text-sm text-green-600">+15% vs poprzedni okres</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Liczba rezerwacji</div>
                  <div className="text-2xl font-bold text-gray-900">{reservations.length}</div>
                  <div className="text-sm text-green-600">+8% vs poprzedni okres</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Średnia wartość</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {reservations.length > 0 ? 
                      Math.round(stats.monthlyRevenue / reservations.length).toLocaleString('pl-PL') : 0} zł
                  </div>
                  <div className="text-sm text-green-600">+6% vs poprzedni okres</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Wykorzystanie floty</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round((stats.activeReservations / stats.totalCars) * 100)}%
                  </div>
                  <div className="text-sm text-red-600">-3% vs poprzedni okres</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Przychód w czasie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <div className="font-medium">Wykres przychodów</div>
                      <div className="text-sm">Integracja z Recharts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Popularność kategorii
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <div className="font-medium">Wykres kołowy kategorii</div>
                      <div className="text-sm">Integracja z Recharts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Cars */}
            <Card>
              <CardHeader>
                <CardTitle>Najpopularniejsze pojazdy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cars.slice(0, 3).map((car, index) => (
                    <div key={car.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-accent' : 'bg-green-500'}`}></div>
                        <span className="font-medium text-gray-900">{car.make} {car.model}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.floor(Math.random() * 20) + 5} rezerwacji
                        </div>
                        <div className="text-xs text-gray-500">
                          {(Math.floor(Math.random() * 5000) + 1000).toLocaleString('pl-PL')} zł przychodu
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
