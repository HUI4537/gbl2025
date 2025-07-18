package master

type Master struct {
 ID          uint   `json:"id" gorm:"primaryKey"`
 Sitename    string `json:"sitename" gorm:"default:GBL2025"`
 Projectname string `json:"projectname" gorm:"default:GBL"`
 Year        int    `json:"year" gorm:"default:2025"`
}
