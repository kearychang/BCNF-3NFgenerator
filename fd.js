export { FD };

class FD {
    //initializes field variables and FDs as array of integer arrays of length 2 in form [int,int]
    //integer in binary form represents set so [1001,0100] means FD 'a','d' -> 'b'
    //lhs, rhs are char arrays of equal length, maxSize is the number of attributes in your table
    constructor(lhs, rhs, maxSize) {
        this.size = maxSize;
        this.length = lhs.length;
        this.binaryForm = new Array(lhs.length);
        this.combinationArr = [];
        this.keyArr = [];
        this.bcnfArr = [];

        //given an array of characters as argument, returns bit mask where it is 1 if it contains the letter in that position
        //e.g. toBinary([a,b,f],7) => 1100010
        //e.g. toBinary([b,c,e],5) => 01101
        for (var i = 0; i < lhs.length; i++) {
            this.binaryForm[i] = [0, 0];
            this.binaryForm[i][0] = this.toBinary(lhs[i], maxSize);
            this.binaryForm[i][1] = this.toBinary(rhs[i], maxSize);
        };
        this.removeDuplicate();
    }

    //getter for binaryForm array
    getBinaryForm() {
        return this.binaryForm;
    }

    //returns binary number where 'a' is 1 << (size - 1), 'b' is 1 << (size - 2) and so on
    //arr is char array, size is max number of digits in binary number
    toBinary(arr, size) {
        var bitMask = 0b0;
        var shiftN;
        for (var i = 0; i < arr.length; i++) {
            shiftN = size - (arr[i].charCodeAt(0) - 97) - 1;
            bitMask = bitMask | (0b1 << shiftN);
        }
        return bitMask;
    }

    //returns string of characters separated by commas
    //arr binary number array, size is max number of digits in binary number
    binaryToString(arr, size) {
        var str = "";
        var firstLetter = true;
        for (var i = 0; i < arr.length; i++) {
            firstLetter = true;
            for (var n = 0; n < this.size; n++) {
                if ((arr[i] & (1 <<(size - n - 1))) != 0) {
                    if (firstLetter) {
                        firstLetter = false;
                    } else {
                        str += ", ";
                    }
                    str += String.fromCharCode(97+n);
                }
            }
            str += "<br>";
        }
        return str;
    }

    //return number of 1s in binary form of number
    //only works for 0 < x < 2^32 - 1
    countOnes(x) {
        x = x - ((x >> 1) & 0x55555555);
        x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
        x = (x + (x >> 4)) & 0x0F0F0F0F;
        x = x + (x >> 8);
        x = x + (x >> 16);
        return (x & 0x0000003F);
    }

    //returns FD array in string format
    //arr is FD as array of integer arrays of length 2, debug is boolean which prints to console if true
    getString(arr, debug) {
        var x;
        var str = "";
        var isFirstChar = false;
        var isChar = false;
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < 2; j++) {
                (debug) ? console.log(arr[i][j].toString(2)): x;
                for (var n = 0; n < this.size; n++) {
                    (debug) ? console.log("i " + i + " j " + j + " n " + n): x;
                    isChar = (arr[i][j] & (1 << (this.size - n - 1))) > 0;
                    if (isChar) {
                        if (isFirstChar) {
                            str += ", "
                        }
                        str += String.fromCharCode(97 + n);
                    } else {
                        continue;
                    }
                    if (!isFirstChar) {
                        isFirstChar = true;
                    }
                }
                isFirstChar = false;
                (j == 0) ? str += " -> " : str += "<br>";
            }
            str += "\n";
        }
        (debug) ? console.log(str): x;
        return str;
    }

    //remove duplicate FDs in binaryForm array
    removeDuplicate() {
        var n = 0;
        for (var i = this.binaryForm.length - 1; i >= 0; i = i - n - 1) {
            n = 0;
            for (var j = i - 1; j >= 0; j--) {
                // console.log("i = " + i + " j = " + j + " n = " + n);
                if (this.binaryForm[i-n][0] == this.binaryForm[j][0] && this.binaryForm[i-n][1] == this.binaryForm[j][1]) {
                    this.binaryForm.splice(j,1);
                    n++;
                }
            }
        }
        this.length = this.binaryForm.length;
    }

    //returns binaryForm array after merging FDs that have the same LHS
    union() {
        var unionArr = [];
        var includedArr = new Array(this.length).fill(false);
        var lhs, lhs2, rhs;
        for (var i = 0; i < this.length; i++) {
            if (!includedArr[i]) {
                lhs = this.binaryForm[i][0];
                rhs = this.binaryForm[i][1];
                includedArr[i] = true;
                for (var j = 0; j < this.length; j++) {
                    if (!includedArr[j]) {
                        lhs2 = this.binaryForm[j][0];
                        if (lhs == lhs2) {
                            includedArr[j] = true;
                            rhs = rhs | this.binaryForm[j][1];
                        }
                    }
                }
                unionArr.push([lhs,rhs]);
            }
        }
        this.binaryForm = unionArr;
        this.length = this.binaryForm.length;
        return this.binaryForm;
    }

    //returns binaryForm array after splitting FDs that have more than 1 attribute on RHS
    decomposition() {
        var isChar = false;
        for (var i = this.binaryForm.length - 1; i >= 0; i--) {
            //check if RHS has more than 1 "1" ex) 1101  or 0011
            if (Math.log2(this.binaryForm[i][1])%1 != 0) {
                for (var n = 0; n < this.size; n++) {
                    isChar = (this.binaryForm[i][1] & (1 << (this.size - n - 1)));
                    if (isChar) {
                        this.binaryForm.push([this.binaryForm[i][0], 1 << (this.size - n - 1)]);
                    }
                }
                this.binaryForm.splice(i,1);
            }
            isChar = false;
        }
        this.removeDuplicate();
        return this.binaryForm;
    }

    //returns binaryForm array after removing all transitive FDs X -> Z if X -> Y and Y -> Z exists
    transitivity() {
        //create adjacency matrix so we can topologically sort our FD, that has (number of attributes) rows and columns
        var adj_mat = new Array(this.size);
        var lhs,rhs,nLHS,nRHS;
        for (var n = 0; n < this.size; n++) {
            adj_mat[n] = new Array(this.size).fill(0);
        }
        for (var i = 0; i < this.length; i++) {
            lhs = this.binaryForm[i][0];
            rhs = this.binaryForm[i][1];
            nRHS = this.size - Math.log2(rhs) - 1;
            if (Math.log2(lhs)%1 == 0) {
                nLHS = this.size - Math.log2(lhs) - 1;
                adj_mat[nLHS][nRHS] = 1;
            } else {
                for (var n = 0; n < this.size; n++) {
                    if ((this.binaryForm[i][0] & (1 << (this.size - n - 1))) > 0) {
                        nLHS = n;
                        adj_mat[nLHS][nRHS] = 1;
                    }
                }
            }
        }

        //topological sort by DFS
        var topArr = [];
        var visitedArr = new Array(this.size).fill(false);

        function dfs(n, length) {
            visitedArr[n] = true;
            for (var i = 0; i < length; i++) {
                if (!visitedArr[i] && (adj_mat[n][i] > 0)) {
                    dfs(i, length);
                }
            }
            topArr.push(n);
        }

        for (var i = 0; i < adj_mat.length; i++) {
            if (!visitedArr[i]) {
                dfs(i, this.length);
            }
        }
        topArr.reverse()
        topArr = topArr.map((e) => (1 << (this.size - e - 1)));

        //given sorted ordering by DFS, create array of FD in order that 
        var newBinaryForm = new Array(this.length);
        var includedKey = 0b0;
        var counter = 0;

        visitedArr = new Array(this.length).fill(false);
        for (var n = 0; n < topArr.length; n++) {
            includedKey = includedKey | topArr[n];
            for (var i = 0; i < this.binaryForm.length; i++) {
                if (((this.binaryForm[i][0] & includedKey) == this.binaryForm[i][0]) && !visitedArr[i]) {
                    visitedArr[i] = true;
                    newBinaryForm[counter] = this.binaryForm[i];
                    counter++;
                }
            }
        }
        this.binaryForm = newBinaryForm;

        //with topologically ordered FD, iterate through FD excluding excluding one and see if that FD is redundant
        var visitedBinary, lhs, rhs;
        for (var i = 0; i < this.length; i++) {
            lhs = this.binaryForm[i][0];
            rhs = this.binaryForm[i][1];
            visitedBinary = lhs;
            for (var j = 0; j < this.length; j++) {
                if (j != i && ((visitedBinary & this.binaryForm[j][0]) == this.binaryForm[j][0])) {
                    visitedBinary = visitedBinary | this.binaryForm[j][1];
                }
            }
            if ((rhs & visitedBinary) == rhs) {
                this.binaryForm[i] = [0,0];
            }
        }

        //delete all marked FD
        for (var n = this.length - 1; n >= 0; n--) {
            if (this.binaryForm[n][0] == 0 && this.binaryForm[n][1] == 0) {
                this.binaryForm.splice(n,1);
            }
        }
        this.length = this.binaryForm.length;
        return this.binaryForm;
    }

    //returns binaryForm array after replace all pseudo-transitive FDs X Y -> Z with X -> Z if X -> Y exists
    transitivity2() {
        var lhs, rhs, lhs2, rhs2;
        for (var i = 0; i < this.length; i++) {
            lhs = this.binaryForm[i][0];
            rhs = this.binaryForm[i][1];
            if (Math.log2(this.binaryForm[i][0])%1 != 0) {
                for (var j = 0; j < this.length; j++) {
                    if (i != j) {
                        lhs2 = this.binaryForm[j][0];
                        rhs2 = this.binaryForm[j][1];
                        if ((lhs2 & rhs2) == 0 && ((lhs & lhs2) == lhs2) && ((lhs & rhs2) == rhs2)) {
                            this.binaryForm[i][0] = rhs2;
                        }
                    }
                }
            }
        }
        this.removeDuplicate();
        return this.transitivity();
    }

    //return array of all combinations of attributes to test for being a candidate key
    attributeCombination() {
        var includedKeyArr = [];
        var excludedKeyArr = [];
        
        //if key is never on rhs, it is in every key
        var onRHS = false;
        for (var n = 0; n < this.size; n++) {
            onRHS = false;
            for (var i = 0; i < this.length; i++) {
                if ((this.binaryForm[i][1] & (1 << (this.size - n - 1))) != 0) {
                    onRHS = true;
                    break;
                }
            }
            if (!onRHS) {
                includedKeyArr.push(1 << (this.size - n - 1));
            }
        }

        //if key is never on lhs but on rhs, it is not in any key
        var onLHS = false;
        var onRHS = false;
        for (var n = 0; n < this.size; n++) {
            onLHS = false;
            onRHS = false;
            for (var i = 0; i < this.length; i++) {
                if ((this.binaryForm[i][1] & (1 << (this.size - n - 1))) != 0) {
                    onLHS = true;
                    break;
                }
            }
            if (!onLHS) {
                for (var j = 0; j < this.length; j++) {
                    if ((this.binaryForm[j][1] & (1 << (this.size - n - 1))) != 0) {
                        onRHS = true;
                        break;
                    }
                }
                if (onRHS) {
                    excludedKeyArr.push(1 << (this.size - n - 1));
                }
            }
        }

        //create an array which is every combination of attributes, excluding and including certain attributes
        //[a, ab, abc, bc, ac]
        for (var counter = 0; counter <= Math.pow(2,this.size) - 1; counter++) {
            //if generated set doesnt contain included key, include it
            for (var n = 0; n < includedKeyArr.length; n++) {
                if ((counter & includedKeyArr[n]) == 0) {
                   counter = counter | includedKeyArr[n]; 
                }
            }

            //if generated set includes excluded key, skip past it
            for (var n = 0; n < excludedKeyArr.length; n++) {
                if ((counter & excludedKeyArr[n]) > 0) {
                   counter = counter + excludedKeyArr[n]; 
                }
            }
            if (counter > 0) {
                this.combinationArr.push(counter);
            }
        }

        //sort by length
        this.combinationArr.sort(function(x, y) {
            return this.countOnes(x) - this.countOnes(y);
        }.bind(this));

        //return candidateKeyList
        return this.combinationArr;
    }

    //return array of candidate keys in set binary form
    candidateKey() {
        var getBinary = 0b0;
        var closureBinary = Math.pow(2,this.size) - 1;
        var minLength = this.size;
        for (var i = 0; i<this.combinationArr.length; i++) {
            getBinary = this.combinationArr[i];
            if (this.countOnes(this.combinationArr[i]) > minLength) {
                break;
            } else {
                for (var n = 0; n<this.length; n++) {
                    if ((this.binaryForm[n][0] & getBinary) == this.binaryForm[n][0]) {
                        getBinary = getBinary | this.binaryForm[n][1];
                    }
                }
                if (getBinary == closureBinary) {
                    minLength = this.countOnes(this.combinationArr[i]);
                    this.keyArr.push(this.combinationArr[i]);
                }
            }
        }

        //return keyList
        return this.keyArr;
    }

    //returns array of attributes in binary form which are in 3NF
    threeNF() {
        var threeNFArr = [];
        var isCandidateKey = false;
        for (var i = 0; i < this.length; i++) {
            threeNFArr.push(this.binaryForm[i][0] | this.binaryForm[i][1]);
        }
        for (var i = 0; i < this.length; i++) {
            if ((threeNFArr[i] & this.keyArr[0]) == this.keyArr[0]) {
                isCandidateKey = true;
                break;
            }
        }
        if (!isCandidateKey) {
            threeNFArr.push(this.keyArr[0]);
        }
        return threeNFArr;
    }

    //return FD array violating BCNF
    bcnfViolation() {
        var candidateKeyBinary = 0b0;
        var lhs,rhs,lhs2;
        for (var i = 0; i < this.keyArr.length; i++) {
            candidateKeyBinary = candidateKeyBinary | this.keyArr[i];
        }
        for (var i = 0; i < this.length; i++) {
            lhs = this.binaryForm[i][0];
            rhs = this.binaryForm[i][1];
            for (var j = 0; j < this.length; j++) {   
                lhs2 = this.binaryForm[j][0];
                if ((i != j) && ((lhs2 & rhs) == lhs2) && ((lhs2 & candidateKeyBinary) != lhs2)) {
                    this.bcnfArr.push(this.binaryForm[j]);
                }
            }
        }

        return this.bcnfArr;
    }

    //returns array of attributes in binary form which are in BCNF
    bcnf() {
        var decomposeArr = [];
        var remainingBin = Math.pow(2,this.size) - 1;

        function setDifference(a, b, size) {
            var tmp = 0b0;
            for (var i = 0; i < size; i++) {
                tmp = b & (1 << i);
                if ((a & tmp) > 0) {
                    a = a - tmp;
                }
            }
            return a;
        }

        for (var i = 0; i < this.bcnfArr.length; i++) {
            decomposeArr.push(this.bcnfArr[i][0] | this.bcnfArr[i][1]);
            remainingBin = setDifference(remainingBin, this.bcnfArr[i][1], this.size);
        }
        decomposeArr.push(remainingBin);
        return decomposeArr;
    }
}