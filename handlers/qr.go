package handlers

import (
	"ayurtrace/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// GET /qr-provenance/:qr_code
func (h *Handlers) GetQRTraceability(c *gin.Context) {
	code := c.Param("qr_code")

	var doc models.QRDoc
	err := h.DB.Collection("qr_codes").FindOne(c, bson.M{"qr_code": code}).Decode(&doc)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "qr code not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"product_name":      doc.ProductName,
		"traceability_data": doc.TraceabilityData,
	})
}
