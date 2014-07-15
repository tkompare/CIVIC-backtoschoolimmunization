(function(){
	// jQuery on document.ready
	$(function(){
		if(navigator.geolocation)
		{
			$('#findme').html('&nbsp;&nbsp;<button id=address-gps class="btn btn-info btn-small">Find Me</button>');
		}
		
		// Default values object
		var Default = {
			cal_title:'Back to School Immunization Event',
	    cal_summary:'Back to School Immunization Event',
			// The map's DOM object ID
			domid:'map',
			// Start center latutude of the Google map
			lat:41.875,
			// Start center longitude of the Google map
			lng:-87.6425,
			// The TkMap styles wanted
			styles:'grey minlabels',
			// Initial zoom level for the Google map
			zoom:12,
			// The address marker
			AddressMarker:null,
			// Google Fusion Tables URI
			fturl:'https://www.googleapis.com/fusiontables/v1/query',
			// Google maps API key
			googlemapsapikey:'AIzaSyAjvSzRjKbN4UCpTSXRo7wkOCAAYb2GXIo',
			// Google Fusion Tables SQL-like query string for school location data
			immunizeeventquery:'SELECT * FROM 1FNQvfvh2lutYjd7Xr28RDktqSf6D5YugNspV4c8',
			// ImmunizeEvent Array
			ImmunizeEvents:[],
			// infobox.js options
			infoboxoptions:{
				disableAutoPan: false,
				maxWidth: 0,
				pixelOffset: new google.maps.Size(-101, 0),
				zIndex: null,
				boxStyle: {
					background: "url('img/tipbox.gif') no-repeat",
					opacity: 0.92,
					width: "200px"
				},
				closeBoxMargin: "11px 4px 4px 4px",
				closeBoxURL: "img/close.gif",
				infoBoxClearance: new google.maps.Size(20, 30),
				visible: false,
				pane: "floatPane",
				enableEventPropagation: false
			},
			// Now
			now: new Date.parse('now'),
			// Yesterday
			yesterday: new Date.parse('yesterday'),
			// Is this a touch device? USES Modernizr.js
			touch:Modernizr.touch,
			getImmunizeEvents:function(columns,rows,Map)
			{
				// Copy the Back To School immunization Location data to the Back To School immunization object
				for (var i in rows)
				{
					this.ImmunizeEvents[i] = new ImmunizeEvent();
					for(var j in columns)
					{
						var colname = columns[j];
						this.ImmunizeEvents[i].data[colname] = rows[i][j];
					}
					// Create the Google LatLng object
					this.ImmunizeEvents[i].latlng = new google.maps.LatLng(this.ImmunizeEvents[i].data.latitude,this.ImmunizeEvents[i].data.longitude);
					// Create the markers for each school
					if(new Date.parse(this.ImmunizeEvents[i].data.end_date+' '+this.ImmunizeEvents[i].data.end_time).compareTo(this.now) > 0)
					{
						this.ImmunizeEvents[i].marker = new google.maps.Marker({
							position: this.ImmunizeEvents[i].latlng,
							map: Map.Map,
							icon:'img/blue.png',
							shadow:'img/msmarker.shadow.png',
							clickable:true
						});
					}
					else
					{
						this.ImmunizeEvents[i].marker = new google.maps.Marker({
							position: this.ImmunizeEvents[i].latlng,
							map: Map.Map,
							icon:'img/grey.png',
							shadow:'img/msmarker.shadow.png',
							clickable:true
						});
					}
					// Info boxes
					this.ImmunizeEvents[i].infoboxtext = '<div class="infoBox" style="border:2px solid rgb(0,0,128); margin-top:8px; background:#aadffa; padding:5px; font-size:90%;">'+
					this.ImmunizeEvents[i].data.facility_name+'<br>'+
					this.ImmunizeEvents[i].data.street1+'<br>'+this.ImmunizeEvents[i].data.city+', '+this.ImmunizeEvents[i].data.state+' '+this.ImmunizeEvents[i].data.postal_code+
					'<br>'+Date.parse(this.ImmunizeEvents[i].data.begin_date).toString("dddd, MMMM dd")+
					'</div>';
					var options = this.infoboxoptions;
					options.content = this.ImmunizeEvents[i].infoboxtext;
					// Make the info box
					this.ImmunizeEvents[i].infobox = new InfoBox(options);
				}
				for(var i in this.ImmunizeEvents)
				{
					google.maps.event.addListener(this.ImmunizeEvents[i].marker, 'click', this.ImmunizeEvents[i].toggleInfoBox(Map.Map,this.ImmunizeEvents[i].marker,this.ImmunizeEvents[i].infobox));
				}
			},
			// Oh dear lord, browser detection. -10 Charisma. Is the browser android or iPhone?
			isPhone:(navigator.userAgent.match(/iPhone/i) || (navigator.userAgent.toLowerCase().indexOf("android") > -1) || (navigator.userAgent.toLowerCase().indexOf("blackberry") > -1)) ? true : false
		};
		// Put a Pan/Zoom control on the map
		function panZoomControl(controlDiv,Map)
		{
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '1em';
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = '#aadffa';
			//controlUI.style.color = 'white';
			controlUI.style.borderStyle = 'solid';
			controlUI.style.borderWidth = '0px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.style.borderRadius = '6px';
			controlUI.title = 'Click to interact with the map.';
			controlDiv.appendChild(controlUI);
			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.fontFamily = 'sans-serif';
			controlText.style.fontSize = '12px';
			controlText.style.paddingLeft = '.5em';
			controlText.style.paddingRight = '.5em';
			controlText.style.paddingTop = '.3em';
			controlText.style.paddingBottom = '.3em';
			controlText.innerHTML = 'Explore Map';
			controlUI.appendChild(controlText);
			// Setup the click event listeners.
			google.maps.event.addDomListener(controlUI, 'click', function() {
				var cntr = Map.Map.getCenter();
				if(Map.Map.zoomControl === false)
				{
					Map.setPanZoom(true);
					if(Default.touch)
					{
						Map.setTouchScroll(false);
					}
					$('#before-map-fluid,#div-footer').hide(0,function(){
						$('#map-width').css('height','100%');
						$('#map-ratio').css('margin-top', $(window).height());
						controlUI.title = 'Click to close up the map.';
						controlText.innerHTML = 'Minimize';
						Map.Map.setCenter(cntr);
						google.maps.event.trigger(Map.Map, 'resize');
					});
				}
				else
				{
					Map.setPanZoom(false);
					if(Default.touch)
					{
						Map.setTouchScroll(true);
					}
					$('#before-map-fluid,#div-footer').show(0,function(){
						$('#map-width').css('height','');
						$('#map-ratio').css('margin-top','300px');
						controlUI.title = 'Click to interact with the map.';
						controlText.innerHTML = 'Explore Map';
						Map.Map.setCenter(cntr);
						google.maps.event.trigger(Map.Map, 'resize');
						window.scrollTo(0, 1);
					});
				}
			});
		}
		
		/**
		 * Back To School immunization class
		 */
		var ImmunizeEvent = (function(){
			var constructor = function()
			{
				this.data = {};
				this.latlng = null;
				this.marker = null;
				this.infobox = null;
				this.infoboxtext = null;
				
				this.getDistance = function(from){
					return google.maps.geometry.spherical.computeDistanceBetween(this.latlng, from);
				};
				
				this.toggleInfoBox = function(Map,Marker,InfoBox)
				{
					return function(){
						if(InfoBox.visible)
						{
							InfoBox.close(Map,Marker);
						}
						else
						{
							InfoBox.open(Map,Marker);
						}
					};
				};
				
				this.closeInfoBox = function(Map,Marker,InfoBox)
				{
					if(InfoBox.visible)
					{
						InfoBox.close(Map,Marker);
					}
				};
				
			};
			return constructor;
		})();
		
		/**
		 * Google Fusion Table connector and data
		 */
		var FusionTable = (function(){
			var constructor = function(url,query,googlemapsapikey)
			{
				this.columns = null;
				this.rows = null;
				this.url = url+'?sql='+encodeURIComponent(query)+'&key='+googlemapsapikey+'&callback=?';
			};
			return constructor;
		})();
		
		// The Google map base layer object
		var Map = new TkMap({
			domid:Default.domid,
			lat:Default.lat,
			lng:Default.lng,
			styles:Default.styles,
			zoom:Default.zoom
		});
		
		// Start processing
		$('#address,#results,#noresults').hide();
		Map.initMap();
		Map.setPanZoom(false);
		
		// Get the Back To School immunization locations
		var ImmunizeEventsFT = new FusionTable(Default.fturl,Default.immunizeeventquery,Default.googlemapsapikey);
		$.getJSON(ImmunizeEventsFT.url, {
			dataType: 'jsonp',
			timeout: 5000
		})
		.done(function (ftdata) {
			ImmunizeEventsFT.columns = ftdata.columns;
			ImmunizeEventsFT.rows = ftdata.rows;
			Default.getImmunizeEvents(ImmunizeEventsFT.columns,ImmunizeEventsFT.rows,Map);
		})
		.fail(function(){
			alert('Oh, no! We are having trouble getting the information we need from storage.');
		})
		.always(function(){
			// Pan/Zoom
			if(Default.touch)
			{
				Map.setTouchScroll(true);
			}
			var PanZoomControlDiv = document.createElement('div');
			panZoomControl(PanZoomControlDiv,Map);
			PanZoomControlDiv.index = 1;
			Map.Map.controls[google.maps.ControlPosition.TOP_RIGHT].push(PanZoomControlDiv);
		});
		
		// Listeners
		
		// Learn More button
		$('#start-learn').click(function(){
			document.getElementById('learn').scrollIntoView();
		});
		
		// Return to start
		$('#learn-start,#learn-end').click(function(){
			document.getElementById('before-map-fluid').scrollIntoView();
		});
		
		// Record a telephone call attempt
		$('body').on('click','a[href^="tel:"]',function(){
			_gaq.push(['_trackEvent', 'Phone Call Attempt', 'Click', $(this).attr('id')]);
		});
		
	// Record a request for directions
		$('body').on('click','.getdirections',function(){
			_gaq.push(['_trackEvent', 'Get Directions', 'Click', $(this).attr('id')]);
		});
		
		// Do a new search
		$('body').on('click','#newsearch',function(){
			$('#results').hide();
			$('#start').show();
			$('#results').html('');
			for(var i in Default.ImmunizeEvents)
			{
				Default.ImmunizeEvents[i].infobox.close(Map.Map,Default.ImmunizeEvents[i].marker);
			}
			Default.AddressMarker.setVisible(false);
			Default.AddressMarker = null;
			var mapcenter = new google.maps.LatLng(Default.lat,Default.lng);
			Map.Map.panTo(mapcenter);
			Map.Map.setZoom(Default.zoom);
			document.getElementById('before-map-fluid').scrollIntoView();
		});
		
		// Accordion toggle listener
		$('body').on('click','.accordion-toggle',function(){
			var immunizeeventid = String($(this).attr('id')).replace(/[^0-9]/g,'');
			if($(this).attr('class').match(/collapse/) !== null || $('#collapse-'+immunizeeventid).attr('class').match(/in/) === null)
			{
				for(var i in Default.ImmunizeEvents)
				{
					Default.ImmunizeEvents[i].infobox.close(Map.Map,Default.ImmunizeEvents[i].marker);
				}
				Map.Map.panTo(Default.ImmunizeEvents[immunizeeventid].latlng);
				Map.Map.setZoom(15);
				Default.ImmunizeEvents[immunizeeventid].infobox.open(Map.Map,Default.ImmunizeEvents[immunizeeventid].marker);
				_gaq.push(['_trackEvent', 'Event Details', 'View', Default.ImmunizeEvents[immunizeeventid].data.facility_name]);
			}
			else
			{
				if(! Map.Map.getCenter().equals(Default.AddressMarker.getPosition()))
				{
					Default.ImmunizeEvents[immunizeeventid].closeInfoBox(Map.Map,Default.ImmunizeEvents[immunizeeventid].marker,Default.ImmunizeEvents[immunizeeventid].infobox);
					Map.Map.panTo(Default.AddressMarker.getPosition());
						Map.Map.setZoom(Default.zoom);
					Map.Map.panTo(Default.AddressMarker.getPosition());
				}
			}
		});
		
		// Search button listener
		$('#address-search').click(function(){
			if($('#address-input').val() !== '')
			{
				// Open the results div
				$('#start').hide();
				$('#results').show();

				// Give me all the search
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode(
					{address:$('#address-input').val()+', Chicago, Illinois'},
					function(results, status)
					{
						if (status == google.maps.GeocoderStatus.OK)
						{
							if (results[0])
							{
								Default.AddressMarker = new google.maps.Marker({
									position:results[0].geometry.location,
									map: Map.Map,
									icon:'/img/red-dot.png',
									clickable:false
								});
								Map.Map.panTo(Default.AddressMarker.getPosition());
								var numresults = 0;
								var resultHTML = '';
								var beginDate = [];
								var endDate = [];
								
								// Let's sort events by distance to address, as the crow flies. Closest first.
								Default.ImmunizeEvents.sort(function(a,b){
									return a.getDistance(results[0].geometry.location) - b.getDistance(results[0].geometry.location);
								});
								for(var i in Default.ImmunizeEvents)
								{
										numresults++;
										if(numresults === 1)
										{
											resultHTML += '<div><h4>Back to School Immunization Events</h4></div>';
											resultHTML += '<div class="accordion" id="accordion">';
										}
										resultHTML += '<div class="accordion-group">';
										
										// Is it noon or midnight? Javascript does not like "PM/AM" at exactly noon or midnight.
										// Technically, Javascript is right.
										var begintime = Default.ImmunizeEvents[i].data.begin_time;
										if(Default.ImmunizeEvents[i].data.begin_time.match(/^12\:00/))
										{
											if(Default.ImmunizeEvents[i].data.begin_time.match(/PM/i))
											{
												begintime = '12:00';
											}
											else if(Default.ImmunizeEvents[i].data.begin_time.match(/AM/i))
											{
												begintime = '0:00';
											}
										}
										
										// Is it noon or midnight? Javascript does not like "PM/AM" at exactly noon or midnight.
										// Technically, Javascript is right.
										var endtime = Default.ImmunizeEvents[i].data.end_time;
										if(Default.ImmunizeEvents[i].data.end_time.match(/^12\:00/))
										{
											if(Default.ImmunizeEvents[i].data.end_time.match(/PM/i))
											{
												endtime = '12:00';
											}
											else if(Default.ImmunizeEvents[i].data.end_time.match(/AM/i))
											{
												endtime = '0:00';
											}
										}
										if(new Date.parse(Default.ImmunizeEvents[i].data.end_date+' '+Default.ImmunizeEvents[i].data.end_time).compareTo(Default.now) < 0)
										{
											resultHTML += '<div class="accordion-heading" style="background-color:#ddd;"><a id="accordion-toggle-'+i+'" class="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'" style="color:#888">';
											resultHTML += '<span style="text-decoration:line-through">'+Default.ImmunizeEvents[i].data.facility_name+' - '+Math.round(Default.ImmunizeEvents[i].getDistance(Default.AddressMarker.getPosition())/1607*100)/100+' miles</span> - Past Event';
											resultHTML += '</a></div>';
											resultHTML += '<div id="collapse-'+i+'" class="accordion-body collapse"><div class="accordion-inner" style="background-color:#eee;">';
										}
										else
										{
											resultHTML += '<div class="accordion-heading" style="background-color:#aadffa;"><a id="accordion-toggle-'+i+'" class="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'" style="color:#000">';
											resultHTML += '<b>'+Default.ImmunizeEvents[i].data.facility_name+'</b> - '+Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("dddd, MMMM dd")+' - '+Math.round(Default.ImmunizeEvents[i].getDistance(Default.AddressMarker.getPosition())/1607*100)/100+' miles&nbsp;&nbsp;(more info)';
											Default.ImmunizeEvents[i].marker.setIcon('/img/blue.png');
											resultHTML += '</a></div>';
											resultHTML += '<div id="collapse-'+i+'" class="accordion-body collapse"><div class="accordion-inner" style="background-color:#d6f1ff;">';
										}
										resultHTML += Default.ImmunizeEvents[i].data.street1+'<br>'+Default.ImmunizeEvents[i].data.city+', '+Default.ImmunizeEvents[i].data.state+' '+Default.ImmunizeEvents[i].data.postal_code+'<br>';
										
										// Using date.js 'Date' object. See: http://www.datejs.com/
										resultHTML += Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("dddd, MMMM dd, yyyy")+' at '+Default.ImmunizeEvents[i].data.begin_time+' - '+Default.ImmunizeEvents[i].data.end_time+'<br>';
										var phone = String(Default.ImmunizeEvents[i].data.phone).replace(/[^0-9]/g,'');
										var phonetext = '';
										if(Default.isPhone)
										{
											phonetext = '<a id="'+Default.ImmunizeEvents[i].data.facility_name+' '+phone.slice(-10,-7)+'-'+phone.slice(-7,-4)+'-'+phone.slice(-4)+'" href="tel:+1'+phone.slice(-10)+'" style="color:#f22">&#x260E; <u>'+phone.slice(-10,-7)+'-'+phone.slice(-7,-4)+'-'+phone.slice(-4)+'</u></a>';
										}
										else
										{
											phonetext = phone.slice(-10,-7)+'-'+phone.slice(-7,-4)+'-'+phone.slice(-4);
										}
										resultHTML += phonetext+'<br>';
										beginDate[i] = new Date(Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("yyyy"), Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("MM")-1, Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("dd"), Date.parse(begintime).toString("HH"), Date.parse(begintime).toString("mm"), 00);
										endDate[i] = new Date(Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("yyyy"), Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("MM")-1, Date.parse(Default.ImmunizeEvents[i].data.begin_date).toString("dd"), Date.parse(endtime).toString("HH"), Date.parse(endtime).toString("mm"), 00);
										if(new Date.parse(Default.ImmunizeEvents[i].data.end_date+' '+Default.ImmunizeEvents[i].data.end_time).compareTo(Default.now) > 0)
										{
											resultHTML += '<a id="Directions to '+Default.ImmunizeEvents[i].data.facility_name+'" class="getdirections" href="http://www.google.com/maps?saddr='+$('#address-input').val()+' Chicago, IL&daddr='+Default.ImmunizeEvents[i].data.street1+' '+Default.ImmunizeEvents[i].data.city+', '+Default.ImmunizeEvents[i].data.state+' '+Default.ImmunizeEvents[i].data.postal_code+'" target="_blank" style="color:#f22">Get Directions</a> |<span id="ical-'+[i]+'" class="ical"></span>';
										}
										resultHTML += '</div></div>';
									resultHTML += '</div>';
								}
								if(numresults > 0)
								{
									resultHTML += '</div>';
								}
								else
								{
									resultHTML += '<h4>We\'re sorry. We could locate any Back To School immunization locations.</h4>';
								}
								resultHTML += '<div class=marginb2>If none of these locations are convienient for you, <a href="http://www.cityofchicago.org/city/en/depts/cdph/supp_info/clinical_health/immunizations_walk-inclinics.html" target="_blank">CDPH has five walk-in locations that administer free childhood immunizations throught the year.</a></div>';
								resultHTML += '<div class=marginb2><button id=newsearch class="btn btn-danger btn-small">New Search</button></div>';
								$('#results').html(resultHTML);
								for(var i in Default.ImmunizeEvents)
								{
									if(new Date.parse(Default.ImmunizeEvents[i].data.end_date+' '+Default.ImmunizeEvents[i].data.end_time).compareTo(Default.now) > 0)
									{
										$('#ical-'+[i]).icalendar({
											start: beginDate[i],
											end: endDate[i],
											title: Default.cal_title,
											summary: Default.cal_summary,
											description: "Please remember to bring your child's shot record with you.",
											location: Default.ImmunizeEvents[i].data.facility_name+' - '+Default.ImmunizeEvents[i].data.street1+' - '+Default.ImmunizeEvents[i].data.city+' '+Default.ImmunizeEvents[i].data.state+' '+Default.ImmunizeEvents[i].data.postal_code,
											iconSize: 16,
											sites: ['icalendar'],
											echoUrl: 'ical.php'
										});
									}
								}
								document.getElementById('before-map-fluid').scrollIntoView();
								if(results[0].geometry.location_type === 'APPROXIMATE')
								{
									alert('Sorry. We had a hard time locating you. Your search might not be centered properly');
								}
								else
								{
									// Mask the exact address before recording
									// Example: '1456 W Greenleaf Ave' becomes '1400 W Greenleaf Ave'
									var addarray = $.trim($('#address-input').val()).split(' ');
									// Chicago addresses start with numbers. So look for them and mask them.
									if(addarray[0].match(/^[0-9]+$/) !== null)
									{
										var replacement = addarray[0].substr(0,addarray[0].length-2)+'00';
										if(replacement !== '00')
										{
											addarray[0] = replacement;
										}
										else
										{
											addarray[0] = '0';
										}
									}
									var maskedAddress = addarray.join(' ');
									_gaq.push(['_trackEvent', 'Search', 'Address', maskedAddress]);
								}
							}
							else
							{
								alert('Sorry! We couldn\'t find that address.');
							}
						}
						else
						{
							alert('Sorry! We couldn\'t find that address.');
						}
					}
				);
			}
			else
			{
				alert("Please enter an address so we know where to center our search.");
			}
		});
		
		// Find me by device gps
		$('body').on('click','#address-gps',function(){
			_gaq.push(['_trackEvent', 'Find Me Button', 'Click']);
			if(navigator.geolocation)
			{
				navigator.geolocation.getCurrentPosition(
					// Success
					function(position)
					{
						_gaq.push(['_trackEvent', 'GPS', 'Success']);
						var latlng = new google.maps.LatLng(
							position.coords.latitude,
							position.coords.longitude
						);
						codeLatLng(latlng);
					},
					// Failure
					function()
					{
						alert('We\'re sorry. We could not find you. Please type in an address.');
					},
					{
						timeout:5000,
						enableHighAccuracy:true
					}
				);
			}
		});
	});
	
	/**
	 * Find the address of a lat lng pair.
	 */
	function codeLatLng(latlng)
	{
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{'latLng': latlng},
			function(results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					if (results[1])
					{
						var formattedAddress = results[0].formatted_address.split(',');
						$('#address-input').val(formattedAddress[0]);
						$('#address-input').blur();
					}
					else
					{
						alert('We\'re sorry. We could not find an address for this location.');
					}
				}
				else
				{
					alert('We\'re sorry. We could not find an address for this location.');
				}
			}
		);
	}
	
})();