package migrations

import "time"
import "gbl-api/data"

// BoothScoreHistory: 부스별 점수 지급 이력 테이블
// UID: 유저 ID, BID: 부스 ID, Score: 지급 점수, CreatedAt: 지급 시각
// GORM을 위한 struct 정의

type BoothScoreHistory struct {
	ID        uint      `gorm:"primaryKey"`
	UID       string    `gorm:"index"`
	BID       string    `gorm:"index"`
	Score     int
	Type      string    `gorm:"type:varchar(16);index"` // 지급 방식: qr, autoi, 2fa 등
	CreatedAt time.Time
}

func MigrateBoothScoreHistory() error {
	db := data.GetDatabase()
	return db.AutoMigrate(&BoothScoreHistory{})
}
