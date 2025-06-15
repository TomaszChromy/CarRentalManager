import { users, cars, reservations, locations, type User, type InsertUser, type Car, type InsertCar, type Reservation, type InsertReservation, type Location, type InsertLocation } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Cars
  getCar(id: number): Promise<Car | undefined>;
  getAllCars(filters?: {
    category?: string;
    transmission?: string;
    fuelType?: string;
    location?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Car[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;

  // Reservations
  getReservation(id: number): Promise<Reservation | undefined>;
  getReservationsByUser(userId: number): Promise<Reservation[]>;
  getAllReservations(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined>;

  // Locations
  getAllLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cars: Map<number, Car>;
  private reservations: Map<number, Reservation>;
  private locations: Map<number, Location>;
  private currentUserId: number;
  private currentCarId: number;
  private currentReservationId: number;
  private currentLocationId: number;

  constructor() {
    this.users = new Map();
    this.cars = new Map();
    this.reservations = new Map();
    this.locations = new Map();
    this.currentUserId = 1;
    this.currentCarId = 1;
    this.currentReservationId = 1;
    this.currentLocationId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize locations
    const defaultLocations: InsertLocation[] = [
      { name: "Warszawa Centrum", address: "ul. Marszałkowska 1", city: "Warszawa", isActive: true },
      { name: "Warszawa Lotnisko", address: "ul. Żwirki i Wigury 1", city: "Warszawa", isActive: true },
      { name: "Kraków Główny", address: "pl. Kolejowy 1", city: "Kraków", isActive: true },
      { name: "Gdańsk Port", address: "ul. Portowa 1", city: "Gdańsk", isActive: true },
    ];

    defaultLocations.forEach(location => {
      this.createLocation(location);
    });

    // Initialize sample user
    this.createUser({
      username: "admin",
      email: "admin@autowinajem.pl",
      password: "admin123",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "+48 123 456 789",
      licenseNumber: "ABC123456789",
      role: "admin",
    });

    this.createUser({
      username: "customer",
      email: "jan.kowalski@example.com",
      password: "customer123",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "+48 123 456 789",
      licenseNumber: "ABC123456789",
      role: "customer",
    });

    // Initialize sample cars
    const sampleCars: InsertCar[] = [
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
    ];

    sampleCars.forEach(car => {
      this.createCar(car);
    });

    // Initialize sample reservations
    this.createReservation({
      userId: 2,
      carId: 3,
      pickupDate: new Date("2024-12-15T10:00:00"),
      returnDate: new Date("2024-12-17T18:00:00"),
      pickupLocation: "Warszawa Centrum",
      returnLocation: "Warszawa Centrum",
      status: "active",
      totalAmount: "578.00",
      extras: [],
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      loyaltyPoints: 0,
      createdAt: new Date(),
      role: insertUser.role || "customer",
      licenseNumber: insertUser.licenseNumber || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Car methods
  async getCar(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async getAllCars(filters?: {
    category?: string;
    transmission?: string;
    fuelType?: string;
    location?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Car[]> {
    let cars = Array.from(this.cars.values());

    if (filters) {
      if (filters.category) {
        cars = cars.filter(car => car.category === filters.category);
      }
      if (filters.transmission) {
        cars = cars.filter(car => car.transmission === filters.transmission);
      }
      if (filters.fuelType) {
        cars = cars.filter(car => car.fuelType === filters.fuelType);
      }
      if (filters.location) {
        cars = cars.filter(car => car.location === filters.location);
      }
      if (filters.status) {
        cars = cars.filter(car => car.status === filters.status);
      }
      if (filters.minPrice) {
        cars = cars.filter(car => parseFloat(car.pricePerDay) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        cars = cars.filter(car => parseFloat(car.pricePerDay) <= filters.maxPrice!);
      }
    }

    return cars;
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const id = this.currentCarId++;
    const car: Car = {
      ...insertCar,
      id,
      rating: "5.0",
      reviewCount: 0,
      status: insertCar.status || "available",
      hasAirConditioning: insertCar.hasAirConditioning ?? true,
      imageUrl: insertCar.imageUrl || null,
    };
    this.cars.set(id, car);
    return car;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const car = this.cars.get(id);
    if (!car) return undefined;

    const updatedCar = { ...car, ...updates };
    this.cars.set(id, updatedCar);
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    return this.cars.delete(id);
  }

  // Reservation methods
  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async getReservationsByUser(userId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(reservation => reservation.userId === userId);
  }

  async getAllReservations(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }): Promise<Reservation[]> {
    let reservations = Array.from(this.reservations.values());

    if (filters) {
      if (filters.status) {
        reservations = reservations.filter(reservation => reservation.status === filters.status);
      }
      if (filters.startDate) {
        reservations = reservations.filter(reservation => reservation.pickupDate >= filters.startDate!);
      }
      if (filters.endDate) {
        reservations = reservations.filter(reservation => reservation.returnDate <= filters.endDate!);
      }
      if (filters.userId) {
        reservations = reservations.filter(reservation => reservation.userId === filters.userId);
      }
    }

    return reservations;
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentReservationId++;
    const reservation: Reservation = {
      ...insertReservation,
      id,
      createdAt: new Date(),
      status: insertReservation.status || "confirmed",
      extras: insertReservation.extras || [],
    };
    this.reservations.set(id, reservation);
    return reservation;
  }

  async updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;

    const updatedReservation = { ...reservation, ...updates };
    this.reservations.set(id, updatedReservation);
    return updatedReservation;
  }

  // Location methods
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(location => location.isActive);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      ...insertLocation,
      id,
      isActive: insertLocation.isActive ?? true,
    };
    this.locations.set(id, location);
    return location;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car || undefined;
  }

  async getAllCars(filters?: {
    category?: string;
    transmission?: string;
    fuelType?: string;
    location?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Car[]> {
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(cars.category, filters.category));
    }
    if (filters?.transmission) {
      conditions.push(eq(cars.transmission, filters.transmission));
    }
    if (filters?.fuelType) {
      conditions.push(eq(cars.fuelType, filters.fuelType));
    }
    if (filters?.location) {
      conditions.push(eq(cars.location, filters.location));
    }
    if (filters?.status) {
      conditions.push(eq(cars.status, filters.status));
    }
    
    let results;
    if (conditions.length > 0) {
      results = await db.select().from(cars).where(and(...conditions));
    } else {
      results = await db.select().from(cars);
    }
    
    if (filters?.minPrice || filters?.maxPrice) {
      return results.filter(car => {
        const price = parseFloat(car.pricePerDay);
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        return true;
      });
    }
    
    return results;
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const [car] = await db
      .insert(cars)
      .values(insertCar)
      .returning();
    return car;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const [car] = await db
      .update(cars)
      .set(updates)
      .where(eq(cars.id, id))
      .returning();
    return car || undefined;
  }

  async deleteCar(id: number): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async getReservationsByUser(userId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.userId, userId));
  }

  async getAllReservations(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }): Promise<Reservation[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(reservations.status, filters.status));
    }
    if (filters?.userId) {
      conditions.push(eq(reservations.userId, filters.userId));
    }
    
    let results;
    if (conditions.length > 0) {
      results = await db.select().from(reservations).where(and(...conditions));
    } else {
      results = await db.select().from(reservations);
    }
    
    if (filters?.startDate || filters?.endDate) {
      return results.filter(reservation => {
        if (filters.startDate && reservation.pickupDate < filters.startDate) return false;
        if (filters.endDate && reservation.returnDate > filters.endDate) return false;
        return true;
      });
    }
    
    return results;
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values(insertReservation)
      .returning();
    return reservation;
  }

  async updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [reservation] = await db
      .update(reservations)
      .set(updates)
      .where(eq(reservations.id, id))
      .returning();
    return reservation || undefined;
  }

  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.isActive, true));
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }
}

export const storage = new DatabaseStorage();
