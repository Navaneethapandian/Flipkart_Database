const jwt = require("jsonwebtoken");
const config = require("../config/db");


//To authenticate Token

const authenticateToken=(req,res,next)=>{
  console.log("-----inside authenticate")
  const token=req.headers['authorization'];
  console.log("---------token",token)
  if(!token)
      return res.status(401).json({error:'Unauthorized'});
      jwt.verify(token,config.jwtSecret,{expiresIn:'30d'},(err,decoded) =>{
  if(err)
          return res.status(403).json({error:'Forbidden'});
  req.user=decoded;
  next();
  });
};

//Checking based on Role (admin/student/teacher)

const authorizeRole=(role)=>{
   console.log("-----role")
  return (req,res,next)=>{
  if(!role.includes(req.user.role)){
      return res.status(403).json({error:'Forbidden'});
  }
  next();
  };
};



module.exports={authenticateToken,authorizeRole};
