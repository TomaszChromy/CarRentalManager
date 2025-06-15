import type { Car, Reservation, User, Location } from "@shared/schema";

export const mockCars: Car[] = [
  {
    id: 1,
    make: "Toyota",
    model: "Yaris",
    year: 2023,
    category: "economic",
    transmission: "automatic",
    fuelType: "petrol",
    seats: 5,
    luggage: 2,
    hasAirConditioning: true,
    fuelConsumption: "5.2",
    pricePerDay: "89.00",
    imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    status: "available",
    location: "Warszawa Centrum",
    plateNumber: "WAW-001",
    lastServiceDate: new Date("2024-11-15"),
    rating: "5.0",
    reviewCount: 47,
  },
  {
    id: 2,
    make: "Volkswagen",
    model: "Golf",
    year: 2022,
    category: "compact",
    transmission: "manual",
    fuelType: "petrol",
    seats: 5,
    luggage: 3,
    hasAirConditioning: true,
    fuelConsumption: "6.1",
    pricePerDay: "119.00",
    imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    status: "rented",
    location: "Warszawa Centrum",
    plateNumber: "WAW-002",
    lastServiceDate: new Date("2024-11-08"),
    rating: "4.2",
    reviewCount: 23,
  },
  {
    id: 3,
    make: "BMW",
    model: "X3",
    year: 2023,
    category: "suv",
    transmission: "automatic",
    fuelType: "diesel",
    seats: 5,
    luggage: 5,
    hasAirConditioning: true,
    fuelConsumption: "7.8",
    pricePerDay: "289.00",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    status: "maintenance",
    location: "Serwis BMW",
    plateNumber: "WAW-003",
    lastServiceDate: new Date("2024-11-01"),
    rating: "4.9",
    reviewCount: 89,
  },
];

export const mockLocations: Location[] = [
  { id: 1, name: "Warszawa Centrum", address: "ul. Marszałkowska 1", city: "Warszawa", isActive: true },
  { id: 2, name: "Warszawa Lotnisko", address: "ul. Żwirki i Wigury 1", city: "Warszawa", isActive: true },
  { id: 3, name: "Kraków Główny", address: "pl. Kolejowy 1", city: "Kraków", isActive: true },
  { id: 4, name: "Gdańsk Port", address: "ul. Portowa 1", city: "Gdańsk", isActive: true },
];

export const mockReservations: Reservation[] = [
  {
    id: 1,
    userId: 2,
    carId: 3,
    pickupDate: new Date("2024-12-15T10:00:00"),
    returnDate: new Date("2024-12-17T18:00:00"),
    pickupLocation: "Warszawa Centrum",
    returnLocation: "Warszawa Centrum",
    status: "active",
    totalAmount: "578.00",
    extras: [],
    createdAt: new Date("2024-12-10"),
  },
  {
    id: 2,
    userId: 2,
    carId: 1,
    pickupDate: new Date("2024-12-22T09:00:00"),
    returnDate: new Date("2024-12-26T17:00:00"),
    pickupLocation: "Kraków Główny",
    returnLocation: "Kraków Główny",
    status: "confirmed",
    totalAmount: "356.00",
    extras: ["gps"],
    createdAt: new Date("2024-12-08"),
  },
];

export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@autowinajem.pl",
    password: "admin123",
    firstName: "Admin",
    lastName: "System",
    phone: "+48 100 000 000",
    licenseNumber: null,
    role: "admin",
    loyaltyPoints: 0,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    username: "customer",
    email: "jan.kowalski@example.com",
    password: "customer123",
    firstName: "Jan",
    lastName: "Kowalski",
    phone: "+48 123 456 789",
    licenseNumber: "ABC123456789",
    role: "customer",
    loyaltyPoints: 1250,
    createdAt: new Date("2024-01-15"),
  },
];

// Utility functions for generating realistic data
export function generateCarData(count: number): Car[] {
  const makes = ["Toyota", "Volkswagen", "BMW", "Audi", "Ford", "Opel", "Skoda", "Renault"];
  const models = {
    Toyota: ["Yaris", "Corolla", "Camry", "RAV4"],
    Volkswagen: ["Golf", "Polo", "Passat", "Tiguan"],
    BMW: ["X1", "X3", "3 Series", "5 Series"],
    Audi: ["A3", "A4", "Q3", "Q5"],
    Ford: ["Fiesta", "Focus", "Mondeo", "Kuga"],
    Opel: ["Corsa", "Astra", "Insignia", "Crossland"],
    Skoda: ["Fabia", "Octavia", "Superb", "Karoq"],
    Renault: ["Clio", "Megane", "Talisman", "Kadjar"],
  };
  
  const categories = ["economic", "compact", "suv", "premium"];
  const transmissions = ["automatic", "manual"];
  const fuelTypes = ["petrol", "diesel", "electric"];
  const locations = ["Warszawa Centrum", "Kraków Główny", "Gdańsk Port", "Warszawa Lotnisko"];
  
  return Array.from({ length: count }, (_, i) => {
    const make = makes[Math.floor(Math.random() * makes.length)];
    const model = models[make as keyof typeof models][Math.floor(Math.random() * models[make as keyof typeof models].length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    return {
      id: i + 1,
      make,
      model,
      year: 2020 + Math.floor(Math.random() * 4),
      category,
      transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
      fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      seats: 5,
      luggage: Math.floor(Math.random() * 5) + 2,
      hasAirConditioning: Math.random() > 0.1,
      fuelConsumption: (Math.random() * 5 + 4).toFixed(1),
      pricePerDay: (Math.random() * 200 + 80).toFixed(2),
      imageUrl: `https://images.unsplash.com/photo-154992423${i % 10}-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250`,
      status: Math.random() > 0.7 ? "rented" : Math.random() > 0.9 ? "maintenance" : "available",
      location: locations[Math.floor(Math.random() * locations.length)],
      plateNumber: `${["WAW", "KRK", "GDA"][Math.floor(Math.random() * 3)]}-${String(i + 1).padStart(3, "0")}`,
      lastServiceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 100) + 5,
    };
  });
}

export function generateReservationData(count: number, userIds: number[], carIds: number[]): Reservation[] {
  const statuses = ["confirmed", "active", "completed", "cancelled"];
  const locations = ["Warszawa Centrum", "Kraków Główny", "Gdańsk Port", "Warszawa Lotnisko"];
  const extras = [["gps"], ["additional_driver"], ["child_seat"], ["insurance"], []];
  
  return Array.from({ length: count }, (_, i) => {
    const pickupDate = new Date(Date.now() + (Math.random() - 0.5) * 60 * 24 * 60 * 60 * 1000);
    const returnDate = new Date(pickupDate.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000);
    
    return {
      id: i + 1,
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      carId: carIds[Math.floor(Math.random() * carIds.length)],
      pickupDate,
      returnDate,
      pickupLocation: locations[Math.floor(Math.random() * locations.length)],
      returnLocation: locations[Math.floor(Math.random() * locations.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalAmount: (Math.random() * 1000 + 200).toFixed(2),
      extras: extras[Math.floor(Math.random() * extras.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };
  });
}

// Analytics data generators
export function generateRevenueData(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 2000 + 500),
  }));
}

export function generateCategoryPopularity() {
  return [
    { category: "Ekonomiczna", count: Math.floor(Math.random() * 50 + 20), color: "#3B82F6" },
    { category: "Kompaktowa", count: Math.floor(Math.random() * 40 + 15), color: "#10B981" },
    { category: "SUV", count: Math.floor(Math.random() * 30 + 10), color: "#F59E0B" },
    { category: "Premium", count: Math.floor(Math.random() * 20 + 5), color: "#8B5CF6" },
  ];
}
