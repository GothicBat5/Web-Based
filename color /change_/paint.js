const canvas = document.getElementById("palette");
const ctx = canvas.getContext("2d");
const output = document.getElementById("selectedColor");

    // Draw a gradient palette
    function drawPalette() 
    {
      // Horizontal gradient (rainbow)
      const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradientH.addColorStop(0, "red");
      gradientH.addColorStop(0.17, "orange");
      gradientH.addColorStop(0.34, "yellow");
      gradientH.addColorStop(0.51, "green");
      gradientH.addColorStop(0.68, "cyan");
      gradientH.addColorStop(0.85, "blue");
      gradientH.addColorStop(1, "magenta");
      ctx.fillStyle = gradientH;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Vertical gradient (white → transparent → black)
      const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradientV.addColorStop(0, "rgba(255,255,255,1)");
      gradientV.addColorStop(0.5, "rgba(255,255,255,0)");
      gradientV.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = gradientV;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawPalette();
    // Get color on click
    canvas.addEventListener("click", function(event) 
    {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

      output.textContent = "Selected color: " + rgb;
      document.body.style.backgroundColor = rgb; // Example usage
    });
