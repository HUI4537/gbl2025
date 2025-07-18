package migrations

import (
	"gorm.io/gorm"
)

type Master struct {
 ID          uint   `gorm:"primaryKey"`
 Sitename    string `gorm:"default:GBL2025"`
 Projectname string `gorm:"default:GBL"`
 Year        int    `gorm:"default:2025"`
}

func MigrateMaster(db *gorm.DB) {
	db.AutoMigrate(&Master{})
	// 초기값이 없으면 생성
	var count int64
	db.Model(&Master{}).Count(&count)
	if count == 0 {
		db.Create(&Master{Sitename: "GBL2025", Projectname: "GBL", Year: 2025})
	}
}
