import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FiltersSidebarProps {
  filters: {
    category: string;
    transmission: string;
    fuelType: string;
    minPrice: number;
    maxPrice: number;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updatePriceRange = (values: number[]) => {
    onFiltersChange({ ...filters, minPrice: values[0], maxPrice: values[1] });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Filtry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Kategoria</Label>
          <div className="space-y-2">
            {[
              { value: "all", label: "Wszystkie" },
              { value: "economic", label: "Ekonomiczna" },
              { value: "compact", label: "Kompaktowa" },
              { value: "suv", label: "SUV" },
              { value: "premium", label: "Premium" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${option.value}`}
                  checked={filters.category === (option.value === "all" ? "" : option.value)}
                  onCheckedChange={() => updateFilter("category", option.value === "all" ? "" : option.value)}
                />
                <Label
                  htmlFor={`category-${option.value}`}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Cena za dzień</Label>
          <div className="px-2">
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={updatePriceRange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{filters.minPrice} zł</span>
              <span>{filters.maxPrice} zł</span>
            </div>
          </div>
        </div>

        {/* Transmission */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Skrzynia biegów</Label>
          <RadioGroup 
            value={filters.transmission || "all"} 
            onValueChange={(value) => updateFilter("transmission", value === "all" ? "" : value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="transmission-all" />
              <Label htmlFor="transmission-all" className="text-sm text-gray-600">Wszystkie</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="automatic" id="transmission-auto" />
              <Label htmlFor="transmission-auto" className="text-sm text-gray-600">Automatyczna</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="transmission-manual" />
              <Label htmlFor="transmission-manual" className="text-sm text-gray-600">Manualna</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Fuel Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Paliwo</Label>
          <div className="space-y-2">
            {[
              { value: "all", label: "Wszystkie" },
              { value: "petrol", label: "Benzyna" },
              { value: "diesel", label: "Diesel" },
              { value: "electric", label: "Elektryczny" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`fuel-${option.value}`}
                  checked={filters.fuelType === (option.value === "all" ? "" : option.value)}
                  onCheckedChange={() => updateFilter("fuelType", option.value === "all" ? "" : option.value)}
                />
                <Label
                  htmlFor={`fuel-${option.value}`}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
