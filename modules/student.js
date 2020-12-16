var Common = require("./common")
var Table = require("./tables")

var Student = function (app){
    this.app = app;
    this.common = new Common(app);
    this.table = new Table(app);
}
module.exports = Student;

Student.prototype.performAction = function (req,res){

    const self = this;

    if(req.params.action === 'insert'){
        self.common.commonAdd(self.table.STUDENTS_TABLE,req,res);
    }
    else if(req.params.action === 'update'){
        self.common.commonUpdate(self.table.STUDENTS_TABLE,req,res);
    }
    else if(req.params.action === 'delete'){
        self.common.commonDelete(self.table.STUDENTS_TABLE,req,res);
    }
    else if(req.params.action === 'list'){
        self.common.commonSearch(self.table.STUDENTS_TABLE,req,res);
    }
    else{
        res.status(401).json({status:false,message:'Invalid Access'})
    }
}
