package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// GeoJSON Point for Mongo 2dsphere index.
// Coordinates order: [longitude, latitude]
type GeoPoint struct {
	Type        string     `bson:"type" json:"type"`               // always "Point"
	Coordinates [2]float64 `bson:"coordinates" json:"coordinates"` // [lng, lat]
}

type CollectionEvent struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"         json:"id,omitempty"`
	CollectorID    string             `bson:"collector_id"           json:"collector_id"` // e.g., farmer/collector user id
	Species        string             `bson:"species"                json:"species"`      // e.g., "Ashwagandha"
	QualityMetrics string             `bson:"quality_metrics,omitempty" json:"quality_metrics,omitempty"`
	Location       GeoPoint           `bson:"location"               json:"location"` // GeoJSON Point
	TimestampMS    int64              `bson:"ts"                     json:"ts"`       // unix millis
}
