import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Location } from "@shared/schema";

export default function SearchForm() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const { toast } = useToast();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const handleSearch = () => {
    if (!pickupLocation || !pickupDate || !returnDate) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie pola",
        variant: "destructive",
      });
      return;
    }

    if (new Date(returnDate) <= new Date(pickupDate)) {
      toast({
        title: "Błąd",
        description: "Data zwrotu musi być późniejsza niż data odbioru",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukces",
      description: "Wyszukiwanie samochodów...",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="pickup-location" className="text-sm font-medium text-gray-700 mb-2 block">
            Miejsce odbioru
          </Label>
          <Select value={pickupLocation} onValueChange={setPickupLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz lokalizację" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="pickup-date" className="text-sm font-medium text-gray-700 mb-2 block">
            Data odbioru
          </Label>
          <Input
            id="pickup-date"
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <Label htmlFor="return-date" className="text-sm font-medium text-gray-700 mb-2 block">
            Data zwrotu
          </Label>
          <Input
            id="return-date"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={pickupDate || new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Szukaj
        </Button>
      </div>
    </div>
  );
}
