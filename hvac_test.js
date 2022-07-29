defineVirtualDevice("HVAC_test", {
    title: "Simple switch",
    cells: {
	enabled: {
	    type: "switch",
	    value: false
	},
    }
});

defineRule("init_alarm", {
    whenChanged: "wb-gpio"/"A1_IN",
    then: function (newValue, devName, cellName) {
      if (newValue) {
        dev.HVAC_test.enabled = 1;
      } else {
        dev.HVAC_test.enabled = 0;
        log("Alarm A1_IN");
      }
    }
  });

var timeout_ms = 20 * 1000;
var timer_out = null;

defineRule("timer_switch", {
    whenChanged: "HVAC_test/enabled",
    then: function (newValue, devName, cellName) {
        if (timer_out) {
            clearTimeout(timer_out);
        }
        timer_out = setTimeout(function () {
            if (dev["wb-gpio"]["A2_IN"] == 0) { 
                dev.HVAC_test.enabled = 0;
                log("Alarm A2_IN");
            }
            timer_out = null;
        }, timeout_ms);        
    }
  });



defineRule("temp_switcher", {
  whenChanged: "HVAC_test/enabled",
  then: function (newValue, devName, cellName) {
    if (dev.HVAC_test.enabled) {
        dev["wb-gpio"]["EXT1_R3A1"] = 1; 
        if (dev["wb-w1"]["28-00000d6b460c"] > 25) {
            dev["wb-mao4_209"]["Channel 1"] = 8000;
        } else {
            dev["wb-mao4_209"]["Channel 1"] = 2000;
        }
    } else {
        dev["wb-mao4_209"]["Channel 1"] = 0;
    }
  }
});