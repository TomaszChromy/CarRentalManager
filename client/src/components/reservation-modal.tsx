import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { Car, Location } from "@shared/schema";

interface ReservationModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

const reservationSchema = z.object({
  pickupDate: z.string().min(1, "Data odbioru jest wymagana"),
  pickupTime: z.string().min(1, "Godzina odbioru jest wymagana"),
  returnDate: z.string().min(1, "Data zwrotu jest wymagana"),
  returnTime: z.string().min(1, "Godzina zwrotu jest wymagana"),
  pickupLocation: z.string().min(1, "Miejsce odbioru jest wymagane"),
  returnLocation: z.string().min(1, "Miejsce zwrotu jest wymagane"),
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(1, "Telefon jest wymagany"),
  licenseNumber: z.string().min(1, "Numer prawa jazdy jest wymagany"),
  extras: z.array(z.string()).default([]),
  acceptTerms: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  marketingConsent: z.boolean().default(false),
});

type ReservationForm = z.infer<typeof reservationSchema>;

const extraOptions = [
  { id: "gps", name: "GPS / Nawigacja", description: "System nawigacji GPS", price: 15 },
  { id: "additional_driver", name: "Dodatkowy kierowca", description: "Drugi uprawniony kierowca", price: 25 },
  { id: "child_seat", name: "Fotelik dziecięcy", description: "Bezpieczny fotelik samochodowy", price: 20 },
  { id: "insurance", name: "Ubezpieczenie CASCO", description: "Pełne ubezpieczenie pojazdu", price: 45 },
];

export default function ReservationModal({ car, isOpen, onClose }: ReservationModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const form = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      pickupTime: "10:00",
      returnTime: "18:00",
      extras: [],
      acceptTerms: false,
      marketingConsent: false,
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/reservations", data);
    },
    onSuccess: () => {
      toast({
        title: "Sukces!",
        description: "Rezerwacja została pomyślnie złożona!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił błąd podczas składania rezerwacji",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    const pickupDate = form.watch("pickupDate");
    const returnDate = form.watch("returnDate");
    
    if (!pickupDate || !returnDate) return 0;
    
    const days = Math.ceil(
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (days <= 0) return 0;
    
    const carPrice = parseFloat(car.pricePerDay) * days;
    const extrasPrice = selectedExtras.reduce((sum, extraId) => {
      const extra = extraOptions.find(e => e.id === extraId);
      return sum + (extra ? extra.price * days : 0);
    }, 0);
    const insurance = 30;
    const subtotal = carPrice + extrasPrice + insurance;
    const vat = subtotal * 0.23;
    
    return subtotal + vat;
  };

  const onSubmit = (data: ReservationForm) => {
    const pickupDateTime = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
    const returnDateTime = new Date(`${data.returnDate}T${data.returnTime}:00`);
    
    if (returnDateTime <= pickupDateTime) {
      toast({
        title: "Błąd",
        description: "Data zwrotu musi być późniejsza niż data odbioru",
        variant: "destructive",
      });
      return;
    }

    const reservationData = {
      userId: 2, // Mock user ID - would come from auth context
      carId: car.id,
      pickupDate: pickupDateTime.toISOString(),
      returnDate: returnDateTime.toISOString(),
      pickupLocation: data.pickupLocation,
      returnLocation: data.returnLocation,
      totalAmount: calculateTotal().toFixed(2),
      extras: selectedExtras,
    };

    createReservationMutation.mutate(reservationData);
  };

  const handleExtraChange = (extraId: string, checked: boolean) => {
    if (checked) {
      setSelectedExtras([...selectedExtras, extraId]);
    } else {
      setSelectedExtras(selectedExtras.filter(id => id !== extraId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rezerwacja samochodu</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Car Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <img 
                src={car.imageUrl || "/placeholder-car.jpg"} 
                alt={`${car.make} ${car.model}`}
                className="w-20 h-12 rounded object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {car.make} {car.model}
                </h3>
                <p className="text-gray-600">
                  {car.category} • {car.transmission} • {car.fuelType}
                </p>
                <div className="text-lg font-bold text-primary mt-1">
                  {car.pricePerDay} zł/dzień
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Okres wynajmu</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup-date">Data i godzina odbioru</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="pickup-date"
                    type="date"
                    {...form.register("pickupDate")}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    type="time"
                    {...form.register("pickupTime")}
                  />
                </div>
                {form.formState.errors.pickupDate && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.pickupDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="return-date">Data i godzina zwrotu</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="return-date"
                    type="date"
                    {...form.register("returnDate")}
                    min={form.watch("pickupDate") || new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    type="time"
                    {...form.register("returnTime")}
                  />
                </div>
                {form.formState.errors.returnDate && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.returnDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Lokalizacja</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup-location">Miejsce odbioru</Label>
                <Select onValueChange={(value) => form.setValue("pickupLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz miejsce odbioru" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.pickupLocation && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.pickupLocation.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="return-location">Miejsce zwrotu</Label>
                <Select onValueChange={(value) => form.setValue("returnLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz miejsce zwrotu" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.returnLocation && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.returnLocation.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Dane kierowcy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Imię</Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="licenseNumber">Numer prawa jazdy</Label>
                <Input id="licenseNumber" {...form.register("licenseNumber")} />
                {form.formState.errors.licenseNumber && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.licenseNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Extras */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Dodatki</h4>
            <div className="space-y-3">
              {extraOptions.map((extra) => (
                <div key={extra.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={extra.id}
                      checked={selectedExtras.includes(extra.id)}
                      onCheckedChange={(checked) => handleExtraChange(extra.id, checked as boolean)}
                    />
                    <div>
                      <Label htmlFor={extra.id} className="font-medium text-gray-900 cursor-pointer">
                        {extra.name}
                      </Label>
                      <div className="text-sm text-gray-500">{extra.description}</div>
                    </div>
                  </div>
                  <div className="text-primary font-medium">+{extra.price} zł/dzień</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Podsumowanie kosztów</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Wynajem ({car.pricePerDay} zł/dzień)</span>
                <span className="text-gray-900">
                  {form.watch("pickupDate") && form.watch("returnDate") ? 
                    (Math.ceil((new Date(form.watch("returnDate")).getTime() - new Date(form.watch("pickupDate")).getTime()) / (1000 * 60 * 60 * 24)) * parseFloat(car.pricePerDay)).toFixed(2) : "0.00"} zł
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dodatki</span>
                <span className="text-gray-900">
                  {selectedExtras.reduce((sum, extraId) => {
                    const extra = extraOptions.find(e => e.id === extraId);
                    const days = form.watch("pickupDate") && form.watch("returnDate") ? 
                      Math.ceil((new Date(form.watch("returnDate")).getTime() - new Date(form.watch("pickupDate")).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    return sum + (extra ? extra.price * days : 0);
                  }, 0).toFixed(2)} zł
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ubezpieczenie podstawowe</span>
                <span className="text-gray-900">30 zł</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (23%)</span>
                <span className="text-gray-900">{(calculateTotal() * 0.23 / 1.23).toFixed(2)} zł</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Łącznie</span>
                  <span className="text-primary">{calculateTotal().toFixed(2)} zł</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                {...form.register("acceptTerms")}
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
                Akceptuję regulamin usługi oraz politykę prywatności
              </Label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
            )}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketingConsent"
                {...form.register("marketingConsent")}
              />
              <Label htmlFor="marketingConsent" className="text-sm text-gray-600 cursor-pointer">
                Wyrażam zgodę na otrzymywanie informacji marketingowych
              </Label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createReservationMutation.isPending}
            >
              {createReservationMutation.isPending ? "Składanie..." : "Potwierdź rezerwację"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
