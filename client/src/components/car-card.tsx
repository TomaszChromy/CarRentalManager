import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Luggage, Snowflake, Fuel, Star } from "lucide-react";
import type { Car } from "@shared/schema";

interface CarCardProps {
  car: Car;
  onReserve: () => void;
}

const categoryLabels = {
  economic: "Ekonomiczna",
  compact: "Kompaktowa",
  suv: "SUV",
  premium: "Premium",
};

const transmissionLabels = {
  automatic: "Automatyczna",
  manual: "Manualna",
};

const fuelTypeLabels = {
  petrol: "Benzyna",
  diesel: "Diesel",
  electric: "Elektryczny",
};

export default function CarCard({ car, onReserve }: CarCardProps) {
  const isPopular = parseFloat(car.rating || "0") >= 4.5 && car.reviewCount >= 50;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md smooth-transition p-6 card-hover">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80 h-48 relative">
          <img 
            src={car.imageUrl || "/placeholder-car.jpg"} 
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover rounded-lg"
          />
          {car.status !== "available" && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Badge variant="secondary" className="text-white bg-gray-800">
                {car.status === "rented" ? "Wynajęty" : "Serwis"}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {car.make} {car.model}
              </h3>
              <p className="text-gray-600">
                {categoryLabels[car.category as keyof typeof categoryLabels]} • {" "}
                {transmissionLabels[car.transmission as keyof typeof transmissionLabels]} • {" "}
                {fuelTypeLabels[car.fuelType as keyof typeof fuelTypeLabels]}
              </p>
              {isPopular && (
                <Badge className="mt-1 bg-yellow-100 text-yellow-800">Popularne</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{car.pricePerDay} zł</div>
              <div className="text-sm text-gray-500">za dzień</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              {car.seats} miejsc
            </div>
            <div className="flex items-center">
              <Luggage className="h-4 w-4 mr-2 text-gray-400" />
              {car.luggage} bagaży
            </div>
            <div className="flex items-center">
              <Snowflake className="h-4 w-4 mr-2 text-gray-400" />
              {car.hasAirConditioning ? "Klimatyzacja" : "Bez klimy"}
            </div>
            <div className="flex items-center">
              <Fuel className="h-4 w-4 mr-2 text-gray-400" />
              {car.fuelConsumption}L/100km
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-1">Ocena:</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-900 ml-1">{car.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({car.reviewCount})</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={onReserve} 
              disabled={car.status !== "available"}
              className="px-6 py-2"
            >
              {car.status === "available" ? "Zarezerwuj" : "Niedostępny"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
