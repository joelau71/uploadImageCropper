$(function() {
    // data-uic-background-color:transparent(default)
    // data-uic-remove-content:false(default)
    // data-uic-remove-element:false(default)
    // data-uic-display-height:400(default)
    // data-uic-target-height: auto(default)
    // data-uic-display-width:400(default)
    // data-uic-target-width: auto(default)

    uploadImageCopper = {
        init: function() {
            var self = this;
            var ele = `<div class="image-cropper-wrapper">
                    <div class="image-cropper">
                        <img id="upload_image_preview" />
                        <div class="text-center">
                            <span id="uic-cancel" class="btn btn-primary m-3">Cancel</span>
                            <span id="cropper-button" class="btn btn-primary m-3">Crop</span>
                        </div>
                    </div>
                </div>`;

            this.$body = $("body");
            this.$body.append(ele);

            this.$body.on("change", ".upload-image-copper", function() {
                var $this = $(this);
                var $wrapper = $this.parent().parent();

                if (this.files[0] === undefined) {
                    return false;
                }

                if (
                    this.files[0].type !== "image/png" &&
                    this.files[0].type !== "image/jpeg"
                ) {
                    console.log("Only Accept jpg or png file format!");
                    return false;
                }

                var tWidth = $this.attr("data-uic-target-width") || "auto";
                var tHeight = $this.attr("data-uic-target-height") || "auto";
                var mimeType = this.files[0].type;
                var backgroundColor =
                    $this.attr("data-uic-background-color") || "transparent";

                var base64 = URL.createObjectURL(this.files[0]);

                $this
                    .parent()
                    .parent()
                    .find(".uic-original-upload")
                    .val(base64);

                self.resizeImage(
                    base64,
                    tWidth,
                    tHeight,
                    backgroundColor,
                    mimeType
                ).then(function(res) {
                    /* var img = document.createElement("img"); */
                    /*  img.className = "img-fluid cropit-preview-image"; */

                    /* img.src = res; */
                    $wrapper.addClass("has-upload");
                    $wrapper.find(".uic-preview-image").attr("src", res);
                    /* $wrapper.find(".cropit-preview").empty().append(img); */
                    $wrapper.find(".uic-base64").val(res);
                    $wrapper.find(".uic-state").val("upload");
                    $("#upload_image_preview").removeAttr("src");
                    $(".image-cropper-wrapper").hide();
                });
            });

            this.$body.on("click", ".crop-upload", function() {
                var $file = $(this)
                    .parent()
                    .find(".upload-image-copper");
                var $wrapper = $(".image-cropper-wrapper");
                var that = $file.get(0);

                var src = $file
                    .parent()
                    .parent()
                    .find(".uic-original-upload")
                    .val();
                var $img = $wrapper.find("img");

                $img.get(0).onload = function() {
                    self.setupCropper(that, mimeType);
                    $wrapper.show();
                };
                $img.attr("src", src);
                return false;
            });

            this.$body.on("click", ".uic-remove", function() {
                var $wrapper = $(this)
                    .parent()
                    .parent();
                var $upload = $wrapper.find(".upload-image-copper");
                var removeElement =
                    $upload.attr("data-uic-remove-element") || false;
                if (removeElement) {
                    $wrapper.remove();
                } else {
                    var dWidth = $upload.attr("data-uic-display-width");
                    var dHeight =
                        $upload.attr("data-uic-display-height") || "400";
                    var title = $upload.attr("data-uic-title") || "";

                    $wrapper
                        .find(".uic-preview-image")
                        .attr(
                            "src",
                            `https://via.placeholder.com/${dWidth}x${dHeight}.jpg?text=${title}`
                        );

                    $upload.val("");
                    $wrapper.removeClass("has-upload has-data");
                    $wrapper.find(".cropit-preview").empty();
                    $wrapper.find(".uic-base64").val("");
                    $wrapper.find(".uic-state").val("remove");
                    $("#upload_image_preview").removeAttr("src");
                }
                return false;
            });

            this.update();
        },

        setupCropper: function(file, mimeType) {
            var self = this;
            var $button = $("#cropper-button");
            var $cancel = $("#uic-cancel");
            var $file = $(file);
            var tWidth =
                parseInt($file.attr("data-uic-target-width")) || "auto";
            var tHeight =
                parseInt($file.attr("data-uic-target-height")) || "auto";
            var backgroundColor =
                $file.attr("data-uic-background-color") || "transparent";

            var upload_image_preview = document.querySelector(
                "#upload_image_preview"
            );

            var $wrapper = $file.parent().parent();

            var cropper = new Cropper(upload_image_preview, {
                aspectRatio: tWidth / tHeight,
                ready: function(event) {
                    // Zoom the image to its natural size
                    cropper.zoomTo(0.5);
                }
            });

            $cancel.off().one("click", function() {
                $("#upload_image_preview").removeAttr("src");
                $(".image-cropper-wrapper").hide();
                cropper.destroy();
            });

            $button.off().one("click", function() {
                var canvas = cropper.getCroppedCanvas();
                var data = canvas.toDataURL(mimeType, 1);

                if (tWidth === "auto") {
                    tWidth = (canvas.width / canvas.height) * tHeight;
                }

                if (tHeight === "auto") {
                    tHeight = (canvas.height / canvas.width) * tWidth;
                }

                self.resizeImage(
                    data,
                    tWidth,
                    tHeight,
                    backgroundColor,
                    mimeType
                ).then(function(res) {
                    /*  var img = document.createElement("img");
                    img.className = "img-fluid cropit-preview-image"; */

                    /* img.src = res; */
                    $wrapper.addClass("has-upload");
                    $wrapper.find(".uic-preview-image").attr("src", res);
                    /* $wrapper.find(".cropit-preview").empty().append(img); */
                    $wrapper.find(".uic-base64").val(res);
                    $wrapper.find(".uic-state").val("upload");
                    $("#upload_image_preview").removeAttr("src");
                    $(".image-cropper-wrapper").hide();
                    cropper.destroy();
                });
            });
        },

        update: function() {
            var self = this;
            $(".upload-image-copper").each(function() {
                var $this = $(this);
                if ($this.hasClass("is-upload-image-copper")) return true;
                self.wrapper($this);
            });
        },

        wrapper: function($element) {
            var name = $element.attr("name");
            var path = $element.attr("data-uic-path") || "";
            var dWidth = $element.attr("data-uic-display-width") || 400;
            var dHeight = $element.attr("data-uic-display-height") || 400;
            var title = $element.attr("data-uic-title") || "";
            var remove = $element.attr("data-uic-remove-content") || false;

            var hasData = path ? "has-data" : "";

            $element.addClass("is-upload-image-copper");
            $element.wrap(`<label class="uic-label-wrapper"></label>`);
            var $label = $element.parent();

            if ($element.attr("data-uic-display-width") == undefined) {
                if (path) {
                    $label.append(
                        `<img class="uic-preview-image" style="max-height:${dHeight}px" src="${path}" />`
                    );
                } else {
                    $label.append(
                        `<img class="uic-preview-image" style="max-height:${dHeight}px" src="https://via.placeholder.com/${dWidth}x${dHeight}.jpg?text=${title}" />`
                    );
                }
                $label.wrap(
                    `<div class="upload-image-copper-wrapper ${hasData}"></div>`
                );
            } else {
                if (path) {
                    $label.append(
                        `<img class="img-fluid uic-preview-image" src="${path}" />`
                    );
                } else {
                    $label.append(
                        `<img class="img-fluid uic-preview-image" src="https://via.placeholder.com/${dWidth}x${dHeight}.jpg?text=${title}" />`
                    );
                }
                $label.wrap(
                    `<div class="upload-image-copper-wrapper ${hasData}" style="max-width: ${dWidth}px"></div>`
                );
            }

            var $wrapper = $label.parent();

            $wrapper.append(
                `<input type="hidden" class="uic-base64" name="uic_base64_${name}" />`
            );
            $wrapper.append(
                `<input type="hidden" class="uic-state" name="uic_state_${name}" value="static" />`
            );
            $wrapper.append(
                `<input type="hidden" class="uic-original-upload" name="uic_original_upload" />`
            );
            $label.append("<div class='crop-upload'></div>");
            if (remove) {
                $label.append("<div class='uic-remove'></div>");
            }
        },

        resizeImage: function(
            base64Str,
            width,
            height,
            backgroundColor = "transparent",
            mimeType
        ) {
            return new Promise(function(resolve) {
                var img = new Image();
                img.src = base64Str;
                img.onload = function() {
                    var canvas = document.createElement("canvas");

                    if (width === "auto") {
                        width = (img.width / img.height) * height;
                    }

                    if (height === "auto") {
                        height = (img.height / img.width) * width;
                    }
                    canvas.width = width;
                    canvas.height = height;

                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL(mimeType, 0.9));
                };
            });
        }
    };
    uploadImageCopper.init();
});
