import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "@/components/search-form";
import FiltersSidebar from "@/components/filters-sidebar";
import CarCard from "@/components/car-card";
import ReservationModal from "@/components/reservation-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Car } from "@shared/schema";

export default function Home() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    transmission: "",
    fuelType: "",
    minPrice: 0,
    maxPrice: 1000,
  });
  const [sortBy, setSortBy] = useState("price-asc");

  const { data: cars = [], isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.transmission) params.append("transmission", filters.transmission);
      if (filters.fuelType) params.append("fuelType", filters.fuelType);
      if (filters.minPrice > 0) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice < 1000) params.append("maxPrice", filters.maxPrice.toString());
      
      const response = await fetch(`/api/cars?${params}`);
      return response.json();
    }
  });

  const handleReservation = (car: Car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.pricePerDay) - parseFloat(b.pricePerDay);
      case "price-desc":
        return parseFloat(b.pricePerDay) - parseFloat(a.pricePerDay);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="gradient-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Znajdź idealny samochód</h1>
          <p className="text-xl text-blue-100 mb-8">Profesjonalny wynajem samochodów - szybko, bezpiecznie, komfortowo</p>
          <SearchForm />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Dostępne samochody 
                <span className="text-lg text-gray-500 ml-2">({cars.length} wyników)</span>
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Sortuj: Cena rosnąco</SelectItem>
                  <SelectItem value="price-desc">Sortuj: Cena malejąco</SelectItem>
                  <SelectItem value="rating">Sortuj: Najwyżej oceniane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-80 h-48 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedCars.map((car) => (
                  <CarCard 
                    key={car.id} 
                    car={car} 
                    onReserve={() => handleReservation(car)} 
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {selectedCar && (
        <ReservationModal
          car={selectedCar}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCar(null);
          }}
        />
      )}
    </div>
  );
}
