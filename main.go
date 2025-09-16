package main

import (
	"ayurtrace/db"
	"ayurtrace/handlers"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect Mongo
	store, err := db.Connect(context.Background())
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	defer store.Close(context.Background())

	// Inject DB into handlers
	h := handlers.New(store.Database)

	// Router
	r := gin.Default()

	// Health endpoint
	r.GET("/healthz", func(c *gin.Context) {
		if err := store.Health(c); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"ok": false, "err": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	// App endpoints
	r.POST("/collection-event", h.PostCollectionEvent)
	r.POST("/processing-step", h.PostProcessingStep)
	r.GET("/qr-provenance/:qr_code", h.GetQRTraceability)

	// HTTP server with timeouts
	addr := ":" + getenv("PORT", "8080")
	srv := &http.Server{
		Addr:           addr,
		Handler:        r,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   15 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// Start server
	go func() {
		log.Println("listening on", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http: %v", err)
		}
	}()

	// Graceful shutdown on Ctrl+C / SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
	log.Println("shutdown complete")
}

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
