package handlers

import (
	"ayurtrace/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// POST /processing-step
// Body: { "collection_event_id": "<hex ObjectID>", "step_name": "Drying" }
func (h *Handlers) PostProcessingStep(c *gin.Context) {
	var body struct {
		CollectionEventID string `json:"collection_event_id" binding:"required"`
		StepName          string `json:"step_name"           binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON: " + err.Error()})
		return
	}

	evID, err := primitive.ObjectIDFromHex(body.CollectionEventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid collection_event_id"})
		return
	}

	doc := models.ProcessingStep{
		CollectionEventID: evID,
		StepName:          body.StepName,
		TimestampMS:       time.Now().UnixMilli(),
	}

	res, err := h.DB.Collection("processing_steps").InsertOne(c, doc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "processing step saved", "id": res.InsertedID})
}
