package master

import (
	"gbl-api/data"
	"net/http"
	"github.com/gin-gonic/gin"
)

func GetMasterInfo(c *gin.Context) {
	   var master Master
	   db := data.GetDatabase()
	   // 항상 id=1만 사용
	   result := db.First(&master, 1)
	   if result.Error != nil {
			   // 없으면 생성
			   master = Master{ID: 1, Sitename: "GBL2025", Projectname: "GBL", Year: 2025}
			   db.Create(&master)
	   }
	   c.JSON(http.StatusOK, master)
}

func UpdateMasterInfo(c *gin.Context) {
	   var req Master
	   if err := c.ShouldBindJSON(&req); err != nil {
			   c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			   return
	   }
	   db := data.GetDatabase()
	   var master Master
	   // 항상 id=1만 수정
	   result := db.First(&master, 1)
	   if result.Error != nil {
			   // 없으면 생성
			   master = Master{ID: 1}
	   }
	   master.Sitename = req.Sitename
	   master.Projectname = req.Projectname
	   master.Year = req.Year
	   db.Save(&master)
	   c.JSON(http.StatusOK, master)
}
