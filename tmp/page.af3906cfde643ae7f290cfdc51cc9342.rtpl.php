<?php if(!class_exists('raintpl')){exit;}?><!DOCTYPE html>
<html lang="en">
<head>
  <title>ZeroPaste</title>
  <meta name="robots" content="noindex" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="tpl/../css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
  <link type="text/css" rel="stylesheet" href="tpl/../css/materialize.min.css" />
  <link type="text/css" rel="stylesheet" href="tpl/../css/style.css" />

  <script src="tpl/../js/jquery.js"></script>
  <script src="tpl/../js/materialize.min.js"></script>
  <script src="tpl/../js/sjcl.js"></script>
  <script src="tpl/../js/base64.js"></script>
  <script src="tpl/../js/rawdeflate.js"></script>
  <script src="tpl/../js/rawinflate.js"></script>
  <script src="tpl/../js/zeropaste.js"></script>

  <link type="text/css" rel="stylesheet" href="tpl/../js/highlight.styles/monokai.css">
  <script src="tpl/../js/highlight.pack.js"></script>

</head>

<body class="<?php echo $BACKGROUNDCOLOR;?>">

  <div class="first-row">
    <div class="container <?php echo $BACKGROUNDCOLOR;?>">
      <div class="row">

        <div class="col s12 m12 l6 <?php echo $BACKGROUNDCOLOR;?>">
          <div class="brandbox <?php echo $BACKGROUNDCOLOR;?>">
            <h1 title="ZeroPaste" onclick="window.location.href=scriptLocation();return false;">ZeroPaste</h1>
            <h2>A zero-knowledge pastebin</h2>
            <h3><?php echo $VERSION;?></h3>
          </div>
        </div>

        <div class="col s12 m12 l6 <?php echo $BACKGROUNDCOLOR;?>">
          <div class="aboutbox <?php echo $BACKGROUNDCOLOR;?>">
            <p>ZeroPaste is a minimalist, opensource online pastebin where the server has zero knowledge of pasted data. The data is encrypted/decrypted <i>in the browser</i> using 256 bits AES. ZeroPaste is a forked project based on ZeroBin Alpha 0.19. More information about ZeroBin can be found at <a href="http://sebsauvage.net/wiki/doku.php?id=php:zerobin">its project page</a>.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
  <!-- /.first-row -->

  <div class="notification <?php echo $BACKGROUNDCOLOR;?>">
    <div class="container">
      <div class="row">
        <div class="col s12 m12 l12">

          <div id="status"><?php echo $STATUS;?></div>
          <div id="errormessage" style="display:none"><?php echo htmlspecialchars( $ERRORMESSAGE );?></div>

        </div>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="row">
      <div class="col s12 m12 l12" id="leftcol">
        <div class="card-panel <?php echo $BACKGROUNDCOLOR;?>">
          <div class="row" id="pasteoptions">
            <form class="form-horizontal">
              <div class="input-field col s12 m12 l2">
                <select id="pasteExpiration" name="pasteExpiration">
                  <option value="5min">5 minutes</option>
                  <option value="10min">10 minutes</option>
                  <option value="1hour">1 hour</option>
                  <option value="1day">1 day</option>
                  <option value="1week">1 week</option>
                  <option value="1month" selected="selected">1 month</option>
                  <option value="1year">1 year</option>
                  <option value="never">Never</option>
                </select>
                <label>Expires:</label>
              </div>
              <div class="input-field col s12 m6 l2">
                <input type="checkbox" class="filled-in" id="burnafterreading" name="burnafterreading"/>
                <label for="burnafterreading">Destroy after reading</label>
              </div>
              <div class="input-field col s12 m6 l2">
                <input type="checkbox" class="filled-in" id="opendiscussion" name="opendiscussion"/>
                <label for="opendiscussion">Enable discussion</label>
              </div>
              <div class="input-field col s12 m6 l2 ">
                <input type="checkbox" class="filled-in" id="syntaxcoloring" name="syntaxcoloring"/>
                <label for="syntaxcoloring" class="<?php echo $PRIMARYCOLOR;?>">Syntax coloring</label>
              </div>
              <div class="input-field col s12 m12 l2">
                <select id="language" name="language">

                </select>
              </div>
            </form>
          </div>
          <div class="row">
            <div class="col s12 m12 l12">
              <div id="remainingtime" style="display:none;" class="alert alert-warning remainingtime" role="alert"></div>
              <div class="panel panel-warning" id="pastecontent">
                <div class="panel-heading" id="pasteresult" style="display:none;">
                  <div id="pastelink"></div>
                  <div id="linkbutton"></div>
                </div>
                <div class="panel-body" id="pasteinput">
                 <div id="cleartext" style="display:none;"></div>
                 <div class="input-field col s12">
                  <textarea id="message" name="message" rows="25" class="materialize-textarea"></textarea>
                  <label for="textarea1">Insert your paste here ...</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col s12 m12 l12">
            <div id="buttons">
              <button type="button" class="btn <?php echo $PRIMARYCOLOR;?> tooltipped" data-position="bottom" data-delay="50" data-tooltip="Create New Paste" id="newbutton" onclick="window.location.href=scriptLocation();return false;" style="display:none;"><i class="mdi mdi-pencil"></i></button>
              <button type="button" class="btn <?php echo $ACCENTCOLOR;?> tooltipped" data-position="bottom" data-delay="50" data-tooltip="Submit Paste" id="sendbutton" onclick="send_data();return false;" style="display:none;"><i class="mdi mdi-send"></i></button>
              <button type="button" class="btn <?php echo $PRIMARYCOLOR;?> tooltipped" data-position="bottom" data-delay="50" data-tooltip="Clone this Paste" id="clonebutton" onclick="clonePaste();return false;" style="display:none;"><i class="mdi mdi-content-duplicate"></i></button>
              <button type="button" class="btn <?php echo $PRIMARYCOLOR;?> tooltipped" data-position="bottom" data-delay="50" data-tooltip="Raw Text" id="rawtextbutton" onclick="rawText();return false;" style="display:none;"><i class="mdi mdi-code-tags"></i></button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <div class="row">
    <div class="col s12 m12 l12">
      <div id="discussion" style="display:none;">
       <div class="card-panel <?php echo $BACKGROUNDCOLOR;?>">
        <h4><i class="mdi mdi-comment-text-outline"></i> Discussion</h4>
        <div id="comments"></div>
      </div>
    </div>
  </div>
</div>
<div id="cipherdata" style="display:none;"><?php echo $CIPHERDATA;?></div>

</div>
<!-- /.container -->
</body>
<script type="text/javascript">
  $(document).ready(function() {
    var lang=hljs.listLanguages();
    lang=lang.sort();
    for (var i=0;i<lang.length;i++) {
      $('#language').append("<option value='"+lang[i]+"'>"+lang[i]+"</option>")
    }
    $('select').material_select();
  });
</script>
</html>