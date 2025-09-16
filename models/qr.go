package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type QRDoc struct {
	ID               primitive.ObjectID `bson:"_id,omitempty"      json:"id,omitempty"`
	QRCode           string             `bson:"qr_code"            json:"qr_code"` // unique (indexed)
	ProductName      string             `bson:"product_name,omitempty"  json:"product_name,omitempty"`
	TraceabilityData string             `bson:"traceability_data,omitempty" json:"traceability_data,omitempty"`
}
