import { FD } from './fd.js';

var fd_attributes = new Set().add("a").add("b").add("c").add("e").add("f");
var fd;

$(document).ready((e) => {
    //step 1
    function drawTable(row) {
        var str = "";
        fd_attributes.clear();
        for (var i=0; i<row; i++) {
            fd_attributes.add(String.fromCharCode(97+i)); 
            str += "<th>" + String.fromCharCode(97+i) + "</th>";
        }
        $("#tableAttribute").html(str);
    }

    //step2
    function minimalFD(lhs,rhs) {
        fd = new FD(lhs,rhs,fd_attributes.size);
        $("#fd-list").html(fd.getString(false));
        fd.decomposition();
        $("#fd-list2").html(fd.getString(false));
        fd.transitivity();
        $("#fd-list3").html(fd.getString(false));
        fd.transitivity2();
        $("#fd-list4").html(fd.getString(false));
        return fd;
    }

    //step3
    function candidateKey(fd) {
        $("#ck-list").html(fd.possibleCandidateKey());
        $("#ck-list2").html(fd.candidateKey());
    }

    //step 4
    function bcnf(fd) {
        $("#bcnf-list").html(fd.findFDViolatingBCNF());
        $("#bcnf-list2").html(fd.decomposeBCNF());
    }

    //clicking on steps
    $(".stepClass").click(function () {
        var id = "." + this.id;
        $(".stepClass").removeClass("active");
        $(this).addClass("active");
        $(".stepMessage").addClass("hidden");
        $(".stepForm").addClass("hidden");
        $(id).removeClass("hidden");
    });

    //click button on step 1
    $("#button-fd").click(function () {
        // draw table name
        var n = parseInt($("#nAttribute").val());
        if (isNaN(n)) {
            $("#attributeError").addClass("error");
            return;
        } else {
            if (n < 1 || n > 10) {
                $("#attributeError").addClass("error");
                return;
            } else {
                $("#attributeError").removeClass("error");
                drawTable(n);
            }
        }

        // draw table rows equal to number of FD which are separated by semicolons
        var fdArr = $("#fd").val().split(/[;][\n]*/).filter((e)=>{return e.length > 0;});
        var lhs = new Array(fdArr.length);
        var rhs = new Array(fdArr.length);
        var str = "";
        var ele;
        var arr_split;
        for (var i = 0; i<fdArr.length; i++) {
            //splits FD into lhs and rhs separated by "->"
            ele = fdArr[i];
            arr_split = ele.split("->");
            //error if there is anything except a LHS and RHS in FD
            if (arr_split.length != 2) {
                $("#fdError").addClass("error");
                return;
            }
            //splits LHS and RHS of FD into array of letters, separated by commas or spaces
            lhs[i] = arr_split[0].split(/[,]|[ ]+/).filter((e)=>{return e.length > 0;});
            rhs[i] = arr_split[1].split(/[,]|[ ]+/).filter((e)=>{return e.length > 0;});
            //error if character in LHS isn't an attribute of table
            for (var j = 0; j < lhs[i].length; j++) {
                if (lhs[i][j].length >= 2 || !fd_attributes.has(lhs[i][j])) {
                    $("#fdError").addClass("error");
                    return;
                }
            }
            for (var j = 0; j < rhs[i].length; j++) {
                if (rhs[i][j].length >= 2 || !fd_attributes.has(rhs[i][j])) {
                    $("#fdError").addClass("error");
                    return;
                }
            }
            //create table rows equal to number of FD with arrow depending on whether it is LHS/RHS
            str += "<tr>";
            fd_attributes.forEach((char) => {
                str += "<td>";
                if (lhs[i].find((e) => {return char==e;}) != undefined) {
                    str += "⊥";
                } else if (rhs[i].find((e) => {return char==e;}) != undefined) {
                    str += "↑";
                }
                str += "</td>";
            });
            str += "</tr>";
        };
        var fd = minimalFD(lhs,rhs);
        candidateKey(fd);
        bcnf(fd);
        $("#tableRow").html(str);
        $("#fdError").removeClass("error");
    });

    drawTable(5);
});