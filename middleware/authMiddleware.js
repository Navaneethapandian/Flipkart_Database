const jwt = require("jsonwebtoken");
const config = require("../config/db");

const authenticateToken=(req,res,next)=>{
  const token = req.headers['authorization'];
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

const authorizeRole=(role)=>{
  return (req,res,next)=>{
  if(!role.includes(req.user.role)){
      return res.status(403).json({error:'Forbidden'});
  }
  next();
  };
};

module.exports={authenticateToken,authorizeRole};