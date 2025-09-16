// db/mongo.go
package db

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Store holds the Mongo client + selected database.
type Store struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// Connect initializes MongoDB using env vars or .env file.
func Connect(ctx context.Context) (*Store, error) {
	// Load .env if present (ignore error if file missing)
	_ = godotenv.Load()

	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		return nil, errors.New("MONGO_URI not set")
	}
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		return nil, errors.New("MONGO_DB not set")
	}

	// Connect with timeout
	cctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(cctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Hard ping to verify connectivity
	if err := client.Ping(cctx, nil); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, err
	}

	store := &Store{
		Client:   client,
		Database: client.Database(dbName),
	}

	// Create indexes required by the app
	if err := store.ensureIndexes(ctx); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, err
	}

	return store, nil
}

// Close disconnects the client (call on shutdown).
func (s *Store) Close(ctx context.Context) error {
	if s == nil || s.Client == nil {
		return nil
	}
	return s.Client.Disconnect(ctx)
}

// Health pings the DB (use in /healthz).
func (s *Store) Health(ctx context.Context) error {
	cctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	return s.Client.Ping(cctx, nil)
}

// ensureIndexes sets up useful indexes for this app.
func (s *Store) ensureIndexes(ctx context.Context) error {
	// Unique qr_code
	_, err := s.Database.Collection("qr_codes").Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys:    bson.D{{Key: "qr_code", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	)
	if err != nil {
		return err
	}

	// Geo index on location
	_, err = s.Database.Collection("collection_events").Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys: bson.D{{Key: "location", Value: "2dsphere"}},
		},
	)
	return err
}
