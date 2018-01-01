(function($) {

    var myfile = document.getElementById("myfile");
    myfile.addEventListener('change', readFile);

    /*
        Main function that reads and parses the data from csv file.
        Calls aproppriate functions to generate each users rank
    */
    function readFile() {
        var reader = new FileReader();
        reader.onload = function () {
            data = reader.result;
            lines = data.trim().split('\n');
            headers = lines[0].split(',')
            parsedData = [];
            for (var i = 1; i < lines.length; i++) {
                var line = lines[i].split(',');
                var parsedLine = {}
                for (var j = 0; j < line.length; j++) {
                    var header = headers[j]
                    parsedLine[header] = line[j]
                }
                parsedData.push(parsedLine)
            }
            //console.log(parsedData);
            var VWAP = calcVWAP(parsedData);
            var usersScores = calcScores(parsedData, VWAP);
            sumScores(usersScores);
            displayScores(usersScores);
        };
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsBinaryString(myfile.files[0]);
    }

    /*
        Given a list of transactions this function calculates the volume weighted
        average price.
    */
    function calcVWAP(data) {
        var volume = 0;
        var cumWeightedPrice = 0;
        for (var i = 0; i < data.length; i++) {
            var volumeTraded = parseFloat(data[i].Volume);
            var price = parseFloat(data[i].Last);
            cumWeightedPrice = cumWeightedPrice + (volumeTraded * price);
            volume = volume + volumeTraded;
        }
        //console.log(parseFloat(data[0].Last));
        return cumWeightedPrice/volume;
    }

    /*
        For each buy trade i, trading costs is: Volume x (TPi - VWAP)
        For each sell trades j, trading costs is: Volume x (VWAP - TPj)
        Aggregates user scores for all their transactions
    */
    function calcScores(data, VWAP) {
        usersScores = {};
        for (var i = 0; i < data.length; i++) {
            var transaction = data[i];
            var volume = parseFloat(transaction.Volume);
            var price = parseFloat(transaction.Last);

            if (transaction.Bidder in usersScores) {
                usersScores[transaction.Bidder] = usersScores[transaction.Bidder] + volume * (price - VWAP);
            } else {
                usersScores[transaction.Bidder] = volume * (price - VWAP);
            }

            if (transaction.Asker in usersScores) {
                usersScores[transaction.Asker] = usersScores[transaction.Asker] + volume * (VWAP - price);
            } else {
                usersScores[transaction.Asker] = volume * (VWAP - price);
            }
            //console.log(usersScores);
        }
        return usersScores;
    }

    /*
        Sums all the scores of participants in game and result should be around 0
    */
    function sumScores(scores) {
        var sum = 0;
        for (var score in scores) {
            sum = sum + scores[score];
        }
        //console.log(sum);
        return sum
    }

    /*
        Prints out user ranks in a table
    */
    function displayScores(scores) {
        sortedScores = sortScores(scores);
        console.log(sortedScores);
        var $mytable = $("#mytable");
        for (var i = 0; i < sortedScores.length; i++) {
            $mytable.append("<tr><td>"+i+"</td><td>"+sortedScores[i][0]+"</td><td>"+Math.round(sortedScores[i][1])+"</td></tr>");
        }
    }

    /*
        Sorts object
    */
    function sortScores(scores) {
        var sortedScores = [];
        for (var user in scores) {
            sortedScores.push([user, scores[user]]);
        }
        sortedScores.sort(function(a, b) {
            return a[1] - b[1]
        });
        return sortedScores
    }

})(jQuery);
