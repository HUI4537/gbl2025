package server

import (
	"gbl-api/data"
	"gbl-api/controllers/master"
	"github.com/gin-gonic/gin"
)

// DB 미들웨어 추가
func DBMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		db := data.GetDatabase()
		c.Set("db", db)
		c.Next()
	}
}

func CreateRouter() *gin.Engine {
	   r := gin.Default()

	   // 전역 미들웨어로 DB 설정
	   r.Use(DBMiddleware())

	   r.Static("/getfile/", "./upload")

	   api := r.Group("/api")
	   {
		   api.POST("/upload/", uploadFile)

		   api.DELETE("/boothuser/:bid/", deleteBoothUser)
		   api.POST("/makeboothuser/", makeBoothUser)

		   masterGroup := api.Group("/master")
		   {
			   masterGroup.GET("/", master.GetMasterInfo)
			   masterGroup.POST("/", master.UpdateMasterInfo)
		   }

		   auth := api.Group("/auth")
		   {
			   auth.POST("/login/", authLogin)
			auth.POST("/register/", authRegister)
			auth.POST("/boothadmin/", authBoothAdmin)
		}

		booth := api.Group("/booth")
		{	
			booth.GET("/", getBooths)
			booth.GET("/:bid/", getBooth)
			booth.DELETE("/:bid/", deleteBooth)
			booth.POST("/check/", checkBooth)

			booth.POST("/make/", makeBooth)

			booth.POST("/adduser/", addUser)

			booth.PATCH("/complexity/", setComplexity)

			// 부스별 점수 지급(중복 지급 방지)
			booth.POST("/addscore/", addBoothScore)
		}

		problem := api.Group("/problem")
		{
			problem.GET("/:bid/", problemList)

			problem.POST("/make/:bid/", problemMake)
			problem.POST("/submit/:bid/", problemSubmit)
		}

		ranking := api.Group("/ranking")
		{
			ranking.GET("/", rankingList)
		}

		user := api.Group("/user")
		{
			user.GET("/:uid/", userInfo)
		}

		notification := api.Group("/notification")
		{
			notification.GET("/", notificationList)

			notification.POST("/make/", notificationMake)
		}
	}

	return r
}
