window.onload = function() {

    var chart = new CanvasJS.Chart("chartContainer", {
        
       
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: [
                {y: 80, label: "Your"},
                {y: 20, label: "Mom"},
                
              
            ]
        }]
    });
    chart.render();
    
    }
  