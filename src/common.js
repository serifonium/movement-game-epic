var radSym = 180/Math.PI
function v(t, n) {
    return { x: t, y: n };
  }
  function vc(t, n) {
    return t.x == n.x && t.y == n.y;
  }
  var uniqueId = 0;
  function newId() {
    return self.crypto.randomUUID()
  }
  function randInt(t, n, e = Math.random()) {
    return Math.floor(e * (n + 1 - t)) + t;
  }
  function bias(t, n) {
    let e = Math.pow(1 - n, 3);
    return (t * e) / (t * e - t + 1);
  }
  function falloff(t, n) {
    let e = t + 0.5,
      r = n;
    return 1 / (1 + Math.pow(Math.E, e * r - r));
  }
  function getDistance(t, n) {
    let e = t.x - n.x,
      r = t.y - n.y;
    return Math.sqrt(Math.pow(e, 2) + Math.pow(r, 2));
  }
  function intercept(src, dst, v) {
    const tx = dst.x - src.x;
    const ty = dst.y - src.y;
    const tvx = dst.vx;
    const tvy = dst.vy;
  
    // Get quadratic equation components
    const a = tvx * tvx + tvy * tvy - v * v;
    const b = 2 * (tvx * tx + tvy * ty);
    const c = tx * tx + ty * ty;
  
    // Solve quadratic
    const ts = quad(a, b, c); // See quad(), below
  
    // Find smallest positive solution
    let sol = null;
    if (ts) {
      const t0 = ts[0];
      const t1 = ts[1];
      let t = Math.min(t0, t1);
      if (t < 0) t = Math.max(t0, t1);
      if (t > 0) {
        sol = {
          x: dst.x + dst.vx * t,
          y: dst.y + dst.vy * t
        };
      }
    }
  
    return sol;
  }
  
  /**
   * Return solutions for quadratic
   */
  function quad(a, b, c) {
    let sol = null;
    if (Math.abs(a) < 1e-6) {
      if (Math.abs(b) < 1e-6) {
        sol = Math.abs(c) < 1e-6 ? [0, 0] : null;
      } else {
        sol = [-c / b, -c / b];
      }
    } else {
      let disc = b * b - 4 * a * c;
      if (disc >= 0) {
        disc = Math.sqrt(disc);
        a = 2 * a;
        sol = [(-b - disc) / a, (-b + disc) / a];
      }
    }
    return sol;
  }

  function fetchAngle(a, b) {
    let m = Math.atan((a.y-b.y)/(a.x-b.x))
    if(a.x < b.x) { return m } else { return Math.PI + m }
  }
  function getAngle(t, n) {
    return (Math.atan2(t.x - n.x, t.y - n.y)) / (Math.PI/180)
  }
  function snap(t, n) {
    return Math.floor(t / n) * n;
  }
  function clamp(t, n, e) {
    return t > e ? (t = e) : t < n && (t = n), t;
  }
  function stopOverflow(t, n) {
    return ((t % n) + n) % n;
  }
  function xmur3(t) {
    for (var n = 0, e = 1779033703 ^ t.length; n < t.length; n++)
      e = ((e = Math.imul(e ^ t.charCodeAt(n), 3432918353)) << 13) | (e >>> 19);
   return function () {
      return (
        (e = Math.imul(e ^ (e >>> 16), 2246822507)),
        (e = Math.imul(e ^ (e >>> 13), 3266489909)),
        ((e ^= e >>> 16) >>> 0) / 45e8
      );
    };
  }
  function seedRand() {
    let t = 1;
    for (let n = 0; n < arguments.length; n++) {
      t = xmur3(`${arguments[n]}-${t}`)();
    }
    return t;
  }
  function testRectCollision(t, n, e, r, o, u, a, i) {
    return o > t && o > t + e && u > n && u < n + r;
  }
  function roundPoint(t, n) {
    return t > n ? 1 : 0;
  }
  function average() {
    let t = 0;
    for (let n = 0; n < arguments.length; n++) t += arguments[n];
    return t / arguments.length;
  }
  function stringToChar(t) {
    let n = 0;
    for (let e = 0; e < t.length; e++) {
      n += t[e].charCodeAt() * Math.pow(2, e);
    }
    return n;
  }
  function randRadius(t, n, e) {
    let r = 2 * Math.PI * Math.random(),
      o = randInt(n, e);
    return v(t.x + Math.cos(r) * o, t.y + Math.sin(r) * o);
  }
   
  function rotate(t, n, e) {
    var r = e,
      o = Math.cos(r),
      u = Math.sin(r);
    return {
      x: o * (n.x - t.x) + u * (n.y - t.y) + t.x,
      y: o * (n.y - t.y) - u * (n.x - t.x) + t.y,
    };
  }
  function download(t, n) {
    var e = document.createElement("a");
    e.setAttribute(
      "href",
      "data:text/plaincharset=utf-8," + encodeURIComponent(n)
    ),
      e.setAttribute("download", t),
      (e.style.display = "none"),
      document.body.appendChild(e),
      e.click(),
      document.body.removeChild(e);
  }
  function pxlart(e, t, i) {
    for(let y in i) {
        for(let x in i[y]) {
          if(i[y][x] !== "") {
            ctx.fillStyle = i[y][x]
            ctx.fillRect(cx+e+x*4, cy+t+y*4, 4, 4)
          }
        }
    }
}
  
  function findXinY(array, find) {
    let b = []
    for(let a in array) {
      if(find(a)) b.push(a)
    }
    return b
  }
  function overlapping(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
        return false;
    }
    return true;
}
const pSBC=(p,c0,c1,l)=>{
  let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
  if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
  if(!this.pSBCr)this.pSBCr=(d)=>{
      let n=d.length,x={};
      if(n>9){
          [r,g,b,a]=d=d.split(","),n=d.length;
          if(n<3||n>4)return null;
          x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
      }else{
          if(n==8||n==6||n<4)return null;
          if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
          d=i(d.slice(1),16);
          if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
          else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
      }return x};
  h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
  if(!f||!t)return null;
  if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
  else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
  a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
  if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
  else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}
   
function getFunction(v1_, v2_) {
  let gradient_ = -(v2_.y-v1_.y)/(v2_.x-v1_.x)
  let offset_ = gradient_*v1_.x+v1_.y
  return {gradient:gradient_,offset:offset_,v1:v1_}
}
function findIntersection(f, f2) {
  //console.log(f, gradient, offset)
  let point = v(0, 0)
  if(f.gradient == f2.gradient) return null
  if(Math.abs(f.gradient) != Infinity) {
      point.x = (f.offset - f2.offset) / (f.gradient - f2.gradient)
  } else point.x = f.v1.x
  point.y = f2.gradient*-point.x+f2.offset
  return point
  /* 
      m1*x + b1 = m2*x + b2
      => x = (b2 - b1) / (m1 - m2)

      Then substitute x into either of the original equations to find the y-coordinate of the intersection point:

      y = m1*x + b1
      or
      y = m2*x + b2
  */
}
function overlap(a, b) {
  // Check x and y for overlap
  if (b.pos.x > a.scale.x + a.pos.x || a.pos.x > b.scale.x + b.pos.x || b.pos.y > a.scale.y + a.pos.y || a.pos.y > b.scale.y + b.pos.y) {
      return false;
  }
  return true;
}
