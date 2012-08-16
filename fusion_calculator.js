$(document).ready(function(){

    $('#tabs div').hide();
    $('#tabs div:first').show();
    $('#tabs ul li:first').addClass('active');
    $('#tabs ul li a').click(function(){ 
        $('#tabs ul li').removeClass('active');
        $(this).parent().addClass('active'); 
        var currentTab = $(this).attr('href'); 
        $('#tabs div').hide();
        $(currentTab).show();
        return false;
    });
	
    var options = "";
	Object.keys(demons).forEach(function(d) {
		options += '<option value="' + d + '">' + d + '</option>';
	});
    $(".full_demon_listing").html(options);
});

/************************************************************\
* Update the base level
\************************************************************/
function dropdown_update(demon, changed_base_lvl) {
    $("#" + changed_base_lvl).val(demons[demon]["level"]);
    update();
}

/************************************************************\
* Search for the demon in family list and return the family
\************************************************************/
function get_family(d1) {
	var f = "";
	Object.keys(families).forEach(function(k) {
		if (families[k]["demons"].indexOf(d1) > -1) {
			f = k;
		}
	});
	return f;
}

/************************************************************\
* Calculate the double fusion
\************************************************************/
function update() {
    var fam1 = get_family($("#d1").val()),
		fam2 = get_family($("#d2").val());
	
    var fam_result = fusions[fam1][fam2];
	
    var lvl = parseInt($("#lvl1").val()) + parseInt($("#lvl2").val());
	
	var demon_result = "";
	if (fam_result != "" && families[fam_result]) {
		families[fam_result]["demons"].some(function(d) {
			if((demons[d]["level"] <= lvl) && (lvl <= demons[d]["cutoff"])) {
				demon_result = d;
				return true;
			}
			return false;
		});
	}
	$("#result_text").html(demon_result);
}


/************************************************************\
* Generate a list of compatible starting demons
\************************************************************/
function reverse_start_relist(demon) {
    var new_list = [];
    // Get the target family.
    var fam = get_family(demon);
    // Check each cell in the chart to see if it matches the target family.
	var family_names = Object.keys(families);
	family_names.forEach(function(col) {
		family_names.forEach(function(row) {
			if (fusions && fusions[col] && fusions[col][row] == fam) {
				families[row]["demons"].forEach(function(d) {
					if ($.inArray(d, new_list) == -1) {
						new_list.push(d);
					}
				});
				families[col]["demons"].forEach(function(d) {
					if ($.inArray(d, new_list) == -1) {
						new_list.push(d);
					}
				});
			}
		});
	});
    new_list.sort();
    var options = "";
    for(var i=0; i<new_list.length; i++) {
        options += '<option value="' + new_list[i] + '">' + new_list[i] + '</option>';
    }
    $("select.start_with_listing").html(options);
    if (options == "") {
        document.getElementById("reverse_result_text").innerHTML="No fusions possible.<br><br>";
    }
    reverse_start_changed(new_list[0]);
}

/************************************************************\
* Update the base level
\************************************************************/
function reverse_start_changed(demon) {
	if (demons[demon] && demons[demon]["level"]) {
		$("#start_lvl").val(demons[demon]["level"]);
		reverse_update();
	} else {
		$("#start_lvl").val("");
	}
}

/************************************************************\
* Find compatible demons for fusion
\************************************************************/
function reverse_update() {
	var target = $("#target").val();
	var target_fam = get_family(target);
	var start = $("#start").val();
	var start_fam = get_family(start);
	var start_lvl = $("#start_lvl").val();
	var min = demons[target]["level"] - demons[start]["level"];
	var max = demons[target]["cutoff"] - demons[start]["level"];
	var result_html = "";
	
	if (max > 0) {
		if (min > 1) {
            result_html = "Min level=" + min + "<br>";
        }
		result_html += "Max level=" + max + "<br><br>";
		Object.keys(families).forEach(function(f) {
			if (fusions[f] && fusions[f][start_fam] == target_fam) {
				families[f]["demons"].forEach(function(d) {
					result_html += d + " ( base level: " + demons[d]["level"] + " )<br />";
				});
			}
		});
		$("#reverse_result_text").html(result_html);
	} else {
		$("#reverse_result_text").html("All demon families are too high-level for this result.");
	}
}