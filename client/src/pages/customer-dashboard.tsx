import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Car, Clock, Star, CreditCard, Plus, Download } from "lucide-react";
import type { Reservation, User } from "@shared/schema";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  
  // Mock user data - would come from auth context
  const currentUser = {
    id: 2,
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 123 456 789",
    licenseNumber: "ABC123456789",
    loyaltyPoints: 1250,
  };

  const { data: reservations = [] } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations/user", currentUser.id],
  });

  const stats = {
    totalReservations: reservations.length,
    activeReservations: reservations.filter(r => r.status === "active").length,
    totalDays: 45, // Mock data
    loyaltyPoints: currentUser.loyaltyPoints,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Moje Konto</h1>
        <p className="text-gray-600">Zarządzaj swoimi rezerwacjami i danymi osobowymi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalReservations}</div>
                <div className="text-sm text-gray-500">Rezerwacje łącznie</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.activeReservations}</div>
                <div className="text-sm text-gray-500">Aktywne rezerwacje</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalDays}</div>
                <div className="text-sm text-gray-500">Dni wynajmu</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</div>
                <div className="text-sm text-gray-500">Punkty lojalnościowe</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 px-6 pt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reservations">Moje Rezerwacje</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="payments">Płatności</TabsTrigger>
              <TabsTrigger value="loyalty">Program Lojalnościowy</TabsTrigger>
            </TabsList>
          </div>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="p-6">
            <div className="space-y-6">
              {reservations.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak rezerwacji</h3>
                  <p className="text-gray-600">Nie masz jeszcze żadnych rezerwacji. Zacznij od wyboru samochodu!</p>
                </div>
              ) : (
                reservations.map((reservation) => (
                  <Card key={reservation.id} className={reservation.status === "active" ? "border-green-200 bg-green-50" : ""}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={reservation.status === "active" ? "default" : "secondary"}
                            className={reservation.status === "active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {reservation.status === "active" ? "Aktywna" : 
                             reservation.status === "confirmed" ? "Potwierdzona" : 
                             reservation.status === "completed" ? "Zakończona" : "Anulowana"}
                          </Badge>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Rezerwacja #{reservation.id}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{reservation.totalAmount} zł</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Odbiór</div>
                          <div className="font-medium">
                            {new Date(reservation.pickupDate).toLocaleDateString('pl-PL')}
                          </div>
                          <div className="text-sm text-gray-600">{reservation.pickupLocation}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Zwrot</div>
                          <div className="font-medium">
                            {new Date(reservation.returnDate).toLocaleDateString('pl-PL')}
                          </div>
                          <div className="text-sm text-gray-600">{reservation.returnLocation}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Status</div>
                          <div className="font-medium text-green-600">
                            {reservation.status === "active" ? "W trakcie wynajmu" :
                             reservation.status === "confirmed" ? "Potwierdzona" :
                             reservation.status === "completed" ? "Zakończona" : "Anulowana"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        {reservation.status === "active" && (
                          <Button size="sm">Przedłuż wynajem</Button>
                        )}
                        {reservation.status === "confirmed" && (
                          <>
                            <Button size="sm">Modyfikuj</Button>
                            <Button size="sm" variant="destructive">Anuluj</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">Szczegóły</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Dane osobowe</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Imię</Label>
                    <Input id="firstName" defaultValue={currentUser.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input id="lastName" defaultValue={currentUser.lastName} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={currentUser.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" defaultValue={currentUser.phone} />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">Numer prawa jazdy</Label>
                  <Input id="licenseNumber" defaultValue={currentUser.licenseNumber} />
                </div>
                <div className="pt-4">
                  <Button type="submit">Zapisz zmiany</Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Metody płatności</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj kartę
                </Button>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">•••• •••• •••• 1234</div>
                          <div className="text-sm text-gray-500">Wygasa 12/26</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Domyślna</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Edytuj</Button>
                        <Button size="sm" variant="destructive">Usuń</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Historia płatności</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezerwacja</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kwota</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 Gru 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rezerwacja #12345</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">578 zł</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Zapłacono</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Pobierz fakturę
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="p-6">
            <div className="space-y-6">
              <Card className="gradient-bg text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Program Lojalnościowy</h3>
                      <p className="text-blue-100">Status: Premium</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{currentUser.loyaltyPoints}</div>
                      <div className="text-blue-100">punktów</div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-400 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{width: "75%"}}></div>
                  </div>
                  <div className="flex justify-between text-sm text-blue-100 mt-2">
                    <span>Do następnego poziomu</span>
                    <span>250 punktów</span>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits and Rewards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Twoje korzyści</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        10% zniżki na wszystkie rezerwacje
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Bezpłatna rezygnacja do 24h
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Priorytetowa obsługa klienta
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dostępne nagrody</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-3 text-center">
                        <h5 className="font-medium text-gray-900 mb-1">15% zniżki</h5>
                        <p className="text-sm text-gray-500 mb-2">Na następną rezerwację</p>
                        <Button size="sm">500 punktów</Button>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3 text-center">
                        <h5 className="font-medium text-gray-900 mb-1">Upgrade klasy</h5>
                        <p className="text-sm text-gray-500 mb-2">Bezpłatne ulepszenie</p>
                        <Button size="sm">800 punktów</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
