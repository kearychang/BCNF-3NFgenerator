import { FD } from './fd.js';

var fd_attributes = new Set().add("a").add("b").add("c").add("e").add("f");
var fd;

$(document).ready((e) => {
    //Calls functions for table in Step 1
    function drawTable(row) {
        var str = "";
        fd_attributes.clear();
        for (var i=0; i<row; i++) {
            fd_attributes.add(String.fromCharCode(97+i)); 
            str += "<th>" + String.fromCharCode(97+i) + "</th>";
        }
        $("#tableAttribute").html(str);
    }

    //Calls functions for table in Step 2
    function canonicalCover(lhs,rhs) {
        fd = new FD(lhs,rhs,fd_attributes.size);
        $("#fd-original").html(fd.getString(fd.getBinaryForm(), false));
        $("#fd-decomposed").html(fd.getString(fd.decomposition(), false));
        $("#fd-transitivity").html(fd.getString(fd.transitivity(), false));
        $("#fd-transitivity2").html(fd.getString(fd.transitivity2(), false));
        return fd;
    }

    //Calls functions for table in Step 3
    function candidateKey(fd) {
        $("#ck-combination").html(fd.binaryToString(fd.attributeCombination(), fd_attributes.size));
        $("#ck-list").html(fd.binaryToString(fd.candidateKey(), fd_attributes.size));
    }

    //Calls functions for table in Step 4
    function BCNF_3NF(fd) {
        $("#bcnf-fd-violation").html(fd.getString(fd.bcnfViolation(), false));
        $("#bcnf").html(fd.binaryToString(fd.bcnf(), fd_attributes.size));
        $("#3nf-union").html(fd.getString(fd.union(), false));
        $("#3nf").html(fd.binaryToString(fd.threeNF(), fd_attributes.size));
    }

    //Toggles visibility of text and tables when clicking on Step buttons
    $(".stepClass").click(function () {
        var id = "." + this.id;
        $(".stepClass").removeClass("active");
        $(this).addClass("active");
        $(".stepMessage").addClass("hidden");
        $(".stepForm").addClass("hidden");
        $(id).removeClass("hidden");
    });

    //Input validates Number of Attributes, Functional Dependencies in Step1
    //Parses input text in Functional Dependencies text area and converts to char array
    //Calls functions
    $("#button-fd").click(function () {
        // draw table name
        var n = parseInt($("#number-attribute").val());
        if (isNaN(n)) {
            $("#attribute-error").addClass("error");
            return;
        } else {
            if (n < 1 || n > 10) {
                $("#attribute-error").addClass("error");
                return;
            } else {
                $("#attribute-error").removeClass("error");
                drawTable(n);
            }
        }

        // draw table rows equal to number of FD which are separated by semicolons
        var fdArr = $("#fd-text").val().split(/[;][\n]*/).filter((e)=>{return e.length > 0;});
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
                $("#fd-error").addClass("error");
                return;
            }
            //splits LHS and RHS of FD into array of letters, separated by commas or spaces
            lhs[i] = arr_split[0].split(/[,]|[ ]+/).filter((e)=>{return e.length > 0;});
            rhs[i] = arr_split[1].split(/[,]|[ ]+/).filter((e)=>{return e.length > 0;});
            //error if character in LHS isn't an attribute of table
            for (var j = 0; j < lhs[i].length; j++) {
                if (lhs[i][j].length >= 2 || !fd_attributes.has(lhs[i][j])) {
                    $("#fd-error").addClass("error");
                    return;
                }
            }
            for (var j = 0; j < rhs[i].length; j++) {
                if (rhs[i][j].length >= 2 || !fd_attributes.has(rhs[i][j])) {
                    $("#fd-error").addClass("error");
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
        var fd = canonicalCover(lhs,rhs);
        candidateKey(fd);
        BCNF_3NF(fd);
        $("#tableRow").html(str);
        $("#fd-error").removeClass("error");
    });

    drawTable(5);
});