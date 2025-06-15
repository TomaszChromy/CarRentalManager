import { db } from "./db";
import { users, cars, reservations, locations } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(reservations);
  await db.delete(cars);
  await db.delete(users);
  await db.delete(locations);

  // Insert locations
  const locationData = [
    { name: "Warszawa Centrum", address: "ul. Marszałkowska 1", city: "Warszawa", isActive: true },
    { name: "Warszawa Lotnisko", address: "ul. Żwirki i Wigury 1", city: "Warszawa", isActive: true },
    { name: "Kraków Główny", address: "pl. Kolejowy 1", city: "Kraków", isActive: true },
    { name: "Gdańsk Port", address: "ul. Portowa 1", city: "Gdańsk", isActive: true },
  ];

  const insertedLocations = await db.insert(locations).values(locationData).returning();
  console.log(`✅ Inserted ${insertedLocations.length} locations`);

  // Insert users
  const userData = [
    {
      username: "admin",
      email: "admin@autowinajem.pl",
      password: "admin123",
      firstName: "Admin",
      lastName: "System",
      phone: "+48 100 000 000",
      licenseNumber: null,
      role: "admin",
    },
    {
      username: "customer",
      email: "jan.kowalski@example.com",
      password: "customer123",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "+48 123 456 789",
      licenseNumber: "ABC123456789",
      role: "customer",
    },
  ];

  const insertedUsers = await db.insert(users).values(userData).returning();
  console.log(`✅ Inserted ${insertedUsers.length} users`);

  // Insert cars
  const carData = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
      make: "Audi",
      model: "A3",
      year: 2023,
      category: "compact",
      transmission: "automatic",
      fuelType: "petrol",
      seats: 5,
      luggage: 3,
      hasAirConditioning: true,
      fuelConsumption: "6.5",
      pricePerDay: "159.00",
      imageUrl: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      status: "available",
      location: "Kraków Główny",
      plateNumber: "KRK-001",
      lastServiceDate: new Date("2024-10-20"),
    },
    {
      make: "Mercedes",
      model: "C-Class",
      year: 2024,
      category: "premium",
      transmission: "automatic",
      fuelType: "diesel",
      seats: 5,
      luggage: 4,
      hasAirConditioning: true,
      fuelConsumption: "5.8",
      pricePerDay: "329.00",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      status: "available",
      location: "Warszawa Lotnisko",
      plateNumber: "WAW-004",
      lastServiceDate: new Date("2024-11-20"),
    },
  ];

  const insertedCars = await db.insert(cars).values(carData).returning();
  console.log(`✅ Inserted ${insertedCars.length} cars`);

  // Insert reservations
  const reservationData = [
    {
      userId: insertedUsers[1].id, // customer
      carId: insertedCars[1].id, // VW Golf (rented)
      pickupDate: new Date("2024-12-15T10:00:00"),
      returnDate: new Date("2024-12-17T18:00:00"),
      pickupLocation: "Warszawa Centrum",
      returnLocation: "Warszawa Centrum",
      status: "active",
      totalAmount: "578.00",
      extras: [],
    },
    {
      userId: insertedUsers[1].id, // customer
      carId: insertedCars[0].id, // Toyota Yaris
      pickupDate: new Date("2024-12-22T09:00:00"),
      returnDate: new Date("2024-12-26T17:00:00"),
      pickupLocation: "Kraków Główny",
      returnLocation: "Kraków Główny",
      status: "confirmed",
      totalAmount: "356.00",
      extras: ["gps"],
    },
  ];

  const insertedReservations = await db.insert(reservations).values(reservationData).returning();
  console.log(`✅ Inserted ${insertedReservations.length} reservations`);

  console.log("🎉 Database seeded successfully!");
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seed };