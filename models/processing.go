package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type ProcessingStep struct {
	ID                primitive.ObjectID `bson:"_id,omitempty"        json:"id,omitempty"`
	CollectionEventID primitive.ObjectID `bson:"collection_event_id"   json:"collection_event_id"` // ref -> collection_events._id
	StepName          string             `bson:"step_name"             json:"step_name"`           // e.g., "Drying", "Grinding"
	TimestampMS       int64              `bson:"ts"                    json:"ts"`                  // unix millis
}
