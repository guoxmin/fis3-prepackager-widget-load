'use strict';

function getTemplate(tag, ret) {
    var fileName = tag.split("-")[1];

    var path = "/widget/" + fileName + "/" + fileName + ".html";


    var content = ret[path]["_content"];

    if (!content) {
        fis.log.error("找不到" + fileName + "组件");
    }

    return content;
}



//匹配组件标签
var regString = "<(w-[a-z]+)([^>]+)*(?:>(.*)<\\/\\1>|\\s+\\/)";

//匹配{{val}}
var propReg = /{{([^{}]+)}}/gmi;

//匹配标签的属性和值 k=v
var prostr = /(\S+)\s*\=\s*("[^"]*")|('[^']*')/gi;


//获取组件列表
function render(content, ret) {

    var pattern = new RegExp(regString, "gim");

    var widgets = content.match(pattern);

    if (widgets) {
        content = content.replace(pattern, function(tag, name, props) {

            var propsObj = {};

            if (props) {
                var propsArr = props.trim().match(prostr);

                propsObj = require("querystring").parse(propsArr.join("&").replace(/["']/g, ""));

            }

            var template = getTemplate(name, ret);

            template = template.replace(/^(<([a-z]+)([^<]+)*)(?=>)/, "$1 " + props).replace(propReg, function(prop, $1) {
                return propsObj[$1] || "";
            })


            return template;


        });

        return render(content);

    }


    return content;
}


module.exports = function(ret, conf, settings, opt) {

    fis.util.map(ret.src, function(subpath, file) {
        if (file.isHtmlLike && file.isPage) {

            var content = render(file.getContent(), ret.src);

            file.setContent(content);

        }
    })
}
