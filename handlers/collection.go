package handlers

import (
	"ayurtrace/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handlers struct {
	DB *mongo.Database
}

func New(db *mongo.Database) *Handlers { return &Handlers{DB: db} }

// POST /collection-event
// Body: { "latitude": <float>, "longitude": <float>, "collector_id": "c001", "species": "Ashwagandha", "quality_metrics": "..." }
func (h *Handlers) PostCollectionEvent(c *gin.Context) {
	var body struct {
		Latitude       float64 `json:"latitude"        binding:"required"`
		Longitude      float64 `json:"longitude"       binding:"required"`
		CollectorID    string  `json:"collector_id"    binding:"required"`
		Species        string  `json:"species"         binding:"required"`
		QualityMetrics string  `json:"quality_metrics"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON: " + err.Error()})
		return
	}

	doc := models.CollectionEvent{
		CollectorID:    body.CollectorID,
		Species:        body.Species,
		QualityMetrics: body.QualityMetrics,
		Location: models.GeoPoint{
			Type:        "Point",
			Coordinates: [2]float64{body.Longitude, body.Latitude}, // [lng, lat]
		},
		TimestampMS: time.Now().UnixMilli(),
	}

	res, err := h.DB.Collection("collection_events").InsertOne(c, doc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "collection event saved", "id": res.InsertedID})
}
