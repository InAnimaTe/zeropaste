<?php if(!class_exists('raintpl')){exit;}?><!DOCTYPE html>
<html lang="en">

<head>
    <title>ZeroPaste</title>
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link type="text/css" rel="stylesheet" href="tpl/../css/materialize.min.css" />
    <link type="text/css" rel="stylesheet" href="tpl/../css/font-awesome.min.css" />
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

<body>

    <div class="first-row">
        <div class="container">
            <div class="row">

                <div class="col s12 m6 l6">
                    <div class="brandbox">
                        <h1 title="ZeroPaste" onclick="window.location.href=scriptLocation();return false;">ZeroPaste</h1>
                        <h2>A zero-knowledge pastebin</h2>
                        <h3><?php echo $VERSION;?></h3>
                    </div>
                </div>

                <div class="col s12 m6 l6">
                    <div class="aboutbox">
                        <p>ZeroPaste is a minimalist, opensource online pastebin where the server has zero knowledge of pasted data. The data is encrypted/decrypted <i>in the browser</i> using 256 bits AES. ZeroPaste is a forked project based on ZeroBin Alpha 0.19. More information about ZeroBin can be found at <a href="http://sebsauvage.net/wiki/doku.php?id=php:zerobin">its project page</a>.</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <!-- /.first-row -->

    <div class="notification white">
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

            <div class="col s12 m12 l8" id="leftcol">
                <div class="card-panel white">
                    <div id="remainingtime" style="display:none;" class="alert alert-warning remainingtime" role="alert"></div>

                    <div class="panel panel-warning" id="pastecontent">
                        <div class="panel-heading" id="pasteresult" style="display:none;">
                            <div id="pastelink"></div>
                            <div id="linkbutton"></div>
                        </div>
                        <div class="panel-body" id="pasteinput">
                            <div class="input-field col s12">
                              <textarea id="message" name="message" rows="25" class="materialize-textarea"></textarea>
                              <label for="textarea1">Insert your paste here ...</label>
                            </div>
                        </div>
                    </div>
                    <div id="buttons">
                        <button type="button" class="btn btn-primary" id="newbutton" onclick="window.location.href=scriptLocation();return false;" style="display:none;"><i class="fa fa-pencil"></i> Create New Paste</button>
                        <button type="button" class="btn btn-success" id="sendbutton" onclick="send_data();return false;" style="display:none;"><i class="fa fa-plus"></i> Submit Paste</button>
                        <button type="button" class="btn btn-default" id="clonebutton" onclick="clonePaste();return false;" style="display:none;"><i class="fa fa-files-o"></i> Clone this Paste</button>
                        <button type="button" class="btn btn-default" id="rawtextbutton" onclick="rawText();return false;" style="display:none;"><i class="fa fa-file-text-o"></i> Raw Text</button>
                    </div>
                </div>

            </div>
            <!-- /.col-xs-8 -->

            <div class="col s12 m12 l4" id="rightcol">

                 <div class="card-panel white">
                        <form class="form-horizontal">
                            <div class="input-field col s12">
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
                            <p>
                              <input type="checkbox" class="filled-in" id="burnafterreading" name="burnafterreading"/>
                              <label for="burnafterreading">Destroy after reading</label>
                            </p>
                            <p>
                              <input type="checkbox" class="filled-in" id="opendiscussion" name="opendiscussion"/>
                              <label for="opendiscussion">Enable discussion</label>
                            </p>
                            <p>
                              <input type="checkbox" class="filled-in" id="syntaxcoloring" name="syntaxcoloring"/>
                              <label for="syntaxcoloring">Syntax coloring</label>
                            </p>
                        </form>
                </div>

            </div>
            <!-- /.col-xs-4 -->

        </div>
        <!-- /.row -->

        <div id="discussion" style="display:none;">
            <h4><i class="fa fa-comments"></i> Discussion</h4>
            <div id="comments"></div>
        </div>
        <div id="cipherdata" style="display:none;"><?php echo $CIPHERDATA;?></div>

    </div>
    <!-- /.container -->
</body>
<script type="text/javascript">
$(document).ready(function() {
    $('select').material_select();
});
</script>

</html>