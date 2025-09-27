package server

import (
	"errors"
	"log"
	"strings"
	"time"

	"gbl-api/controllers/booth"
	"gbl-api/migrations"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type makeBoothRequest struct {
	BID          string `json:"bid" binding:"required"`
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description" binding:"required"`
	Part         string `json:"part" binding:"required"`
	VideoURL     string `json:"video_url" binding:"required"`
	ThumbnailURL string `json:"thumbnail_url" binding:"required"`
	PosterURL    string `json:"poster_url" binding:"required"`
	TimeSlot     string `json:"time_slot" binding:"required"`
}

func makeBooth(c *gin.Context) {
	var req makeBoothRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid request",
		})
		return
	}

	db := c.MustGet("db").(*gorm.DB)

	hasPassword, err := booth.HasBoothPasswordByBID(req.BID)
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	if !hasPassword {
		c.JSON(404, gin.H{
			"message": "Booth password not found",
		})
		return
	}

	if _, err := booth.GetBooth(db, req.BID); err == nil {
		c.JSON(409, gin.H{
			"message": "Booth already exists",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	newBooth := booth.Booth{
		BID:          req.BID,
		Name:         req.Name,
		Description:  req.Description,
		Part:         req.Part,
		VideoURL:     req.VideoURL,
		ThumbnailURL: req.ThumbnailURL,
		PosterURL:    req.PosterURL,
		TimeSlot:     strings.ToUpper(req.TimeSlot),
	}

	if err := booth.MakeBooth(newBooth); err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}

func getBooths(c *gin.Context) {
	booths, err := booth.GetBooths()
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}
	c.JSON(200, gin.H{
		"boothlist": booths,
	})
}

func getBooth(c *gin.Context) {
	bid := c.Param("bid")
	db := c.MustGet("db").(*gorm.DB)
	b, err := booth.GetBooth(db, bid)
	if err != nil {
		c.JSON(404, gin.H{
			"message": "Booth not found",
		})
		return
	}
	c.JSON(200, b)
}

type checkBoothRequest struct {
	BID string `json:"bid"`
	UID string `json:"uid"`
}

func checkBooth(c *gin.Context) {
	var req checkBoothRequest
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid request",
		})
		return
	}

	p, err := booth.IsUidInBooth(req.BID, req.UID)
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	if p {
		c.JSON(200, gin.H{
			"participate": true,
		})
	} else {
		c.JSON(200, gin.H{
			"participate": false,
		})
	}
}

func deleteBooth(c *gin.Context) {
	bid := c.Param("bid")

	err := booth.DeleteBooth(bid)
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}

func deleteBoothUser(c *gin.Context) {
	bid := c.Param("bid")

	err1 := booth.DeleteBooth(bid)
	err2 := booth.DeletePasswordByBID(bid)
	if err1 != nil || err2 != nil {
		log.Println(err1, err2)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}
}

func makeBoothUser(c *gin.Context) {
	type Request struct {
		Password string `json:"password"`
	}

	var req Request
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid request",
		})
		return
	}

	err = booth.AddPassword(req.Password)
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}

type addUserReq struct {
	UID string `json:"uid"`
	BID string `json:"bid"`
}

func addUser(c *gin.Context) {
	var req addUserReq
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid request",
		})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	err = booth.AddUIDToBooth(db, req.BID, req.UID)
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}

func setComplexity(c *gin.Context) {
	type Request struct {
		BID        string `json:"bid"`
		Complexity int    `json:"complexity"`
	}

	var req Request
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid request",
		})
		return
	}

	err = booth.SetComplexity(req.BID, req.Complexity)
	if err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"message": "Internal server error",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}

// 부스별 점수 지급(중복 지급 방지)
func addBoothScore(c *gin.Context) {
	type reqType struct {
		UID   string `json:"uid"`
		BID   string `json:"bid"`
		Score int    `json:"score"`
	}
	var req reqType
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}
	db := c.MustGet("db").(*gorm.DB)
	var count int64
	db.Model(&migrations.BoothScoreHistory{}).Where("uid = ? AND bid = ?", req.UID, req.BID).Count(&count)
	if count > 0 {
		c.JSON(400, gin.H{"error": "이미 점수를 받았습니다."})
		return
	}
	// 점수 지급 이력 저장
	db.Create(&migrations.BoothScoreHistory{
		UID:       req.UID,
		BID:       req.BID,
		Score:     req.Score,
		CreatedAt: time.Now(),
	})
	c.JSON(200, gin.H{"success": true})
}
