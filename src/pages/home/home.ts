import { Component, OnInit,ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/http';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ Geolocation, HTTP ,DeviceOrientation],
  
})
export class HomePage implements OnInit {

  // フラグ
  isLocAvail: boolean;
  isLocError: boolean;

  // options
  enableHighAccuracy: boolean = false;

  //メッカの位置情報
  mekkaGeolocation:Geolocation;

  // 結果
  loc_lng: number;
  loc_lat: number;
  rev_geo: string;

  //ロジカルアーツ研究所のそーす
  //https://www.logical-arts.jp/archives/136

  R_EARTH:number			// 地球の赤道半径
  RAD:Math          	// 1°あたりのラジアン


  //メッカの位置情報
  tgt_lng:number;
  tgt_lat:number;

  //回転させる角度
  turnKakudo:number;
  diviceAngle:number;

  constructor(
    private geolocation: Geolocation,
    private http: HTTP,
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation) {
      window.onload = () =>{
        let html:HTMLInputElement;
        let c:HTMLCanvasElement;
        let ctx:CanvasRenderingContext2D;
        let angle:number;
        let image:HTMLImageElement;
        let imgUrl = "./assets/imgs/yajiri_logo.png";
    
          c = <HTMLCanvasElement>document.getElementById("yajiri_img");
          ctx = c.getContext("2d");
    
    this.getLocation();  
     
          angle = this.turnKakudo;
    
          image = new Image();
          image.src = imgUrl;
          image.onload = () =>{
            c.width = image.width ;
            c.height = image.height  ;
            let theta = angle * Math.PI / 180;
 //           ctx.clearRect(0, 0, c.width, c.height);
            ctx.save();
            ctx.translate(c.width / 2, c.height / 2);
            ctx.rotate(theta);
            
            ctx.drawImage(image, -image.width/2, -image.height/2);
            ctx.restore();
            console.log("ctx contents = ",ctx);
            console.log("c contents = ",c);
      }}
    }

  ngAfterViewInit() {
    let html:HTMLInputElement;
    let c:HTMLCanvasElement;
    let ctx:CanvasRenderingContext2D;
    let angle:number;
    let image:HTMLImageElement;
    let imgUrl = "./assets/imgs/yajiri_logo.png";

      c = <HTMLCanvasElement>document.getElementById("yajiri_img");
      ctx = c.getContext("2d");

      this.getLocation();  
 
      angle = this.turnKakudo;

      image = new Image();
      image.src = imgUrl;
      image.onload = () =>{
        c.width = image.width ;
        c.height = image.height  ;
        let theta = angle * Math.PI / 180;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.save();
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(theta);
        
        ctx.drawImage(image, -image.width/2, -image.height/2);
        ctx.restore();
        console.log("ctx contents = ",ctx);
        console.log("c contents = ",c);
      };
  }

  initFlags(){
    this.isLocAvail = false;
    this.isLocError = false;
  }

  ngOnInit(){
    this.initFlags();
  }

  onHighAccuracyChange(t: boolean){
    this.enableHighAccuracy = t;
  }

   getLocation(){
    this.initFlags();

    // オプションの設定
    let options: GeolocationOptions = {
      enableHighAccuracy: this.enableHighAccuracy
    };

    // 緯度経度の取得
      this.geolocation.getCurrentPosition(options)
        .then((resp)=>{

        this.loc_lng = resp.coords.longitude;
        this.loc_lat = resp.coords.latitude;

        //deviceOrientation使ってみる
        this.deviceOrientation.getCurrentHeading().then((resp2)=>
         this.diviceAngle = resp2.trueHeading,
          (error: any) => console.log(error)
        );

        this.isLocAvail = true;
        this.isLocError = false;


     //メッカの方角計算
    //https://www.kyorikeisan.com/ido-keido-kensaku/idotokeidonorekishi/6024.aspx
     this.tgt_lng = 21.389;
     this.tgt_lat = 39.8579;
    
      let R_EARTH = 6378137;
      let RAD = Math.PI / 180;

      let lat1 = this.loc_lat  
      let lon1 = this.loc_lng
      let lat2 = this.tgt_lat
      let lon2 = this.tgt_lng


      // 度をラジアンに変換
      lat1 *= RAD; 
    	lon1 *= RAD;
	    lat2 *= RAD;
	    lon2 *= RAD;

      var lat_c = (lat1 + lat2) / 2;					// 緯度の中心値
      var dx = R_EARTH * (lon2 - lon1) * Math.cos(lat_c);
      var dy = R_EARTH * (lat2 - lat1);
    
      if (dx == 0 && dy == 0) {
        this.turnKakudo =  0;	// dx, dyともに0のときは強制的に0とする。
      }
      else {
        this.turnKakudo = Math.atan2(dy, dx) / RAD;	// 結果は度単位で返す
      }

      //デバイスの角度を減算
      this.turnKakudo = this.turnKakudo - this.diviceAngle;  


      let rose = document.getElementById("yajiri_img");
      if (typeof rose.style.transform !== "undefined") {
        rose.style.transform = "rotateZ(" + this.turnKakudo + "deg)";
       } else if (typeof rose.style.webkitTransform !== "undefined") {
         rose.style.webkitTransform = "rotateZ(" + this.turnKakudo + "deg)";
       }
     
     
      })
      .catch((err)=>{
        this.isLocAvail = false;
        this.isLocError = true;
        console.log(err);
      });
    }
    
    getAzimuth(lat1, lon1, lat2, lon2){
      let R_EARTH = 6378137;
      let RAD = Math.PI / 180;
      	// 度をラジアンに変換
      lat1 *= RAD; 
    	lon1 *= RAD;
	    lat2 *= RAD;
	    lon2 *= RAD;

      var lat_c = (lat1 + lat2) / 2;					// 緯度の中心値
      var dx = R_EARTH * (lon2 - lon1) * Math.cos(lat_c);
      var dy = R_EARTH * (lat2 - lat1);


    
      if (dx == 0 && dy == 0) {
        return 0;	// dx, dyともに0のときは強制的に0とする。
      }
      else {
        return Math.atan2(dy, dx) / RAD;	// 結果は度単位で返す
      }


    }


  
}

