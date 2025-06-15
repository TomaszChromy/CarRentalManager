import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCarSchema, insertReservationSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Użytkownik o tym emailu już istnieje" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Nieprawidłowe dane", errors: error.errors });
      }
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  // Car routes
  app.get("/api/cars", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        transmission: req.query.transmission as string,
        fuelType: req.query.fuelType as string,
        location: req.query.location as string,
        status: req.query.status as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const cars = await storage.getAllCars(filters);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const car = await storage.getCar(carId);
      
      if (!car) {
        return res.status(404).json({ message: "Samochód nie został znaleziony" });
      }

      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(carData);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Nieprawidłowe dane", errors: error.errors });
      }
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.put("/api/cars/:id", async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const updates = req.body;
      const car = await storage.updateCar(carId, updates);
      
      if (!car) {
        return res.status(404).json({ message: "Samochód nie został znaleziony" });
      }

      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.delete("/api/cars/:id", async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const deleted = await storage.deleteCar(carId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Samochód nie został znaleziony" });
      }

      res.json({ message: "Samochód został usunięty" });
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  // Reservation routes
  app.get("/api/reservations", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const reservations = await storage.getAllReservations(filters);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.get("/api/reservations/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reservations = await storage.getReservationsByUser(userId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      
      // Check if car is available
      const car = await storage.getCar(reservationData.carId);
      if (!car || car.status !== "available") {
        return res.status(400).json({ message: "Samochód nie jest dostępny" });
      }

      const reservation = await storage.createReservation(reservationData);
      
      // Update car status to rented
      await storage.updateCar(reservationData.carId, { status: "rented" });
      
      res.status(201).json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Nieprawidłowe dane", errors: error.errors });
      }
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.put("/api/reservations/:id", async (req, res) => {
    try {
      const reservationId = parseInt(req.params.id);
      const updates = req.body;
      const reservation = await storage.updateReservation(reservationId, updates);
      
      if (!reservation) {
        return res.status(404).json({ message: "Rezerwacja nie została znaleziona" });
      }

      res.json(reservation);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  // Location routes
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Użytkownik nie został znaleziony" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      delete updates.password; // Don't allow password updates through this endpoint
      
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "Użytkownik nie został znaleziony" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
