/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

(function($w){
    'use strict';
    var $d = $w.document;
    var __name__ = 'jsMind';
    var jsMind = $w[__name__];
    if(!jsMind){return;}
    if(typeof jsMind.draggable != 'undefined'){return;}

    var jdom = jsMind.util.dom;
    var clear_selection = 'getSelection' in $w ? function(){
            $w.getSelection().removeAllRanges();
        } : function(){
            $d.selection.empty();
        };

    var options = {
        line_width : 5,
        lookup_delay : 500,
        lookup_interval : 80
    };

    jsMind.draggable = function(jm){
        this.jm = jm;
        this.e_canvas = null;
        this.canvas_ctx = null;
        this.shadow = null;
        this.shadow_w = 0;
        this.shadow_h = 0;
        this.active_node = null;
        this.target_node = null;
        this.target_direct = null;
        this.client_w = 0;
        this.client_h = 0;
        this.offset_x = 0;
        this.offset_y = 0;
        this.hlookup_delay = 0;
        this.hlookup_timer = 0;
        this.capture = false;
        this.moved = false;
    };

    jsMind.draggable.prototype = {
        init:function(){
            this._create_canvas();
            this._create_shadow();
            this._event_bind();
        },

        resize:function(){
            this.jm.view.e_nodes.appendChild(this.shadow);
            this.e_canvas.width = this.jm.view.size.w;
            this.e_canvas.height = this.jm.view.size.h;
        },

        _create_canvas:function(){
            var c = $d.createElement('canvas');
            this.jm.view.e_panel.appendChild(c);
            var ctx = c.getContext('2d');
            this.e_canvas = c;
            this.canvas_ctx = ctx;
        },

        _create_shadow:function(){
            var s = $d.createElement('jmnode');
            s.style.visibility = 'hidden';
            s.style.zIndex = '3';
            s.style.cursor = 'move';
            s.style.opacity = '0.7';
            this.shadow = s;
        },

        reset_shadow:function(el){
            var s = this.shadow.style;
            this.shadow.innerHTML = el.innerHTML;
            s.left = el.style.left;
            s.top = el.style.top;
            s.width = el.style.width;
            s.height = el.style.height;
            s.backgroundImage = el.style.backgroundImage;
            s.backgroundSize = el.style.backgroundSize;
            s.transform = el.style.transform;
            this.shadow_w = this.shadow.clientWidth;
            this.shadow_h = this.shadow.clientHeight;
        },

        show_shadow:function(){
            if(!this.moved){
                this.shadow.style.visibility = 'visible';
            }
        },

        hide_shadow:function(){
            this.shadow.style.visibility = 'hidden';
        },

        clear_lines:function(){
            this.canvas_ctx.clearRect(0,0,this.jm.view.size.w,this.jm.view.size.h);
        },

        _magnet_shadow:function(node){
            if(!!node){
                this.canvas_ctx.lineWidth = options.line_width;
                this.canvas_ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                this.canvas_ctx.lineCap = 'round';
                this.clear_lines();
                this.canvas_ctx.beginPath();
                this.canvas_ctx.moveTo(this.shadow.offsetLeft+this.shadow_w/2, this.shadow.offsetTop+this.shadow_h/2);
                this.canvas_ctx.lineTo(node.offsetLeft+node.clientWidth/2, node.offsetTop+node.clientHeight/2);
                this.canvas_ctx.stroke();
            }
        },

        _lookup_close_node:function(){
            var root = this.jm.get_root();
            var root_location = root.get_location();
            var root_size = {w:root.get_size().w + this.shadow_w/2, h:root.get_size().h + this.shadow_h/2};
            var root_x = root.get_offset().x + root_size.w/2;
            var root_y = root.get_offset().y + root_size.h/2;

            var shadow_x = this.shadow.offsetLeft + this.shadow_w/2;
            var shadow_y = this.shadow.offsetTop + this.shadow_h/2;
            var distance_to_root = Math.sqrt(Math.pow(shadow_x-root_x,2) + Math.pow(shadow_y-root_y,2));
            var nodes = this.jm.mind.nodes;
            var min_distance = Number.MAX_VALUE;
            var closest_node = null;
            var closest_direct = null;
            var shadow_node = this.active_node;
            for(var nodeid in nodes){
                var np = nodes[nodeid];
                if(np.isroot || np.id == shadow_node.id){continue;}
                var np_x = np.get_offset().x + np.get_size().w/2;
                var np_y = np.get_offset().y + np.get_size().h/2;
                var distance_to_node = Math.sqrt(Math.pow(shadow_x-np_x,2) + Math.pow(shadow_y-np_y,2));
                var direct = null;
                if(distance_to_node < min_distance){
                    var np_location = np.get_location();
                    if(np_location.y == root_location.y && np_location.x*root_location.x<0){
                        if(np_location.x < 0){
                            direct = jsMind.direction.left;
                        }else{
                            direct = jsMind.direction.right;
                        }
                    }else{
                        direct = (np_location.y > root_location.y) ? jsMind.direction.bottom : jsMind.direction.top;
                    }
                    min_distance = distance_to_node;
                    closest_node = np;
                    closest_direct = direct;
                }
            }
            var desired_direct = null;
            if(shadow_node.parent){
                desired_direct = shadow_node.parent.get_location().y > shadow_node.get_location().y ? jsMind.direction.top : jsMind.direction.bottom;
            }
            if(closest_node != null && min_distance < 50){
                if(closest_node.parent != null && closest_node.parent.id == shadow_node.id){
                    this.target_node = null;
                    this.target_direct = null;
                    this._magnet_shadow(null);
                }else if(shadow_node.parent != null && shadow_node.parent.id == closest_node.id){
                    this.target_node = null;
                    this.target_direct = null;
                    this._magnet_shadow(null);
                }else if(closest_node.id == shadow_node.id){
                    this.target_node = null;
                    this.target_direct = null;
                    this._magnet_shadow(null);
                }else if(closest_node.parent != null && closest_node.parent.id == shadow_node.parent.id){
                    this.target_node = closest_node;
                    this.target_direct = desired_direct;
                    this._magnet_shadow(closest_node.get_node_dom());
                }else{
                    this.target_node = closest_node;
                    this.target_direct = closest_direct;
                    this._magnet_shadow(closest_node.get_node_dom());
                }
            }else{
                this.target_node = null;
                this.target_direct = null;
                this._magnet_shadow(null);
            }
        },

        _event_bind:function(){
            var jd = this;
            var container = this.jm.view.container;
            jdom.add_event(container,'mousedown',function(e){
                var evt = e || event;
                jd.dragstart.call(jd,evt);
            });
            jdom.add_event(container,'mousemove',function(e){
                var evt = e || event;
                jd.drag.call(jd,evt);
            });
            jdom.add_event(container,'mouseup',function(e){
                var evt = e || event;
                jd.dragend.call(jd,evt);
            });
            jdom.add_event(container,'touchstart',function(e){
                var evt = e || event;
                jd.dragstart.call(jd,evt);
            });
            jdom.add_event(container,'touchmove',function(e){
                var evt = e || event;
                jd.drag.call(jd,evt);
            });
            jdom.add_event(container,'touchend',function(e){
                var evt = e || event;
                jd.dragend.call(jd,evt);
            });
        },

        dragstart:function(e){
            if(!this.jm.get_editable()){return;}
            if(this.capture){return;}
            this.active_node = null;

            var jview = this.jm.view;
            var el = e.target || event.srcElement;
            if(el.tagName.toLowerCase() != 'jmnode'){return;}
            var nodeid = jview.get_binded_nodeid(el);
            if(!!nodeid){
                var node = this.jm.get_node(nodeid);
                if(!node.isroot){
                    this.reset_shadow(el);
                    this.active_node = node;
                    this.offset_x = (e.clientX || e.touches[0].clientX) - el.offsetLeft;
                    this.offset_y = (e.clientY || e.touches[0].clientY) - el.offsetTop;
                    this.client_hw = Math.floor(el.clientWidth/2);
                    this.client_hh = Math.floor(el.clientHeight/2);
                    if(this.hlookup_delay != 0){
                        $w.clearTimeout(this.hlookup_delay);
                    }
                    if(this.hlookup_timer != 0){
                        $w.clearInterval(this.hlookup_timer);
                    }
                    var jd = this;
                    this.hlookup_delay = $w.setTimeout(function(){
                        jd.hlookup_delay = 0;
                        jd.hlookup_timer = $w.setInterval(function(){
                            jd._lookup_close_node();
                        },options.lookup_interval);
                    },options.lookup_delay);
                    this.capture = true;
                }
            }
        },

        drag:function(e){
            if(!this.jm.get_editable()){return;}
            if(!this.capture){return;}
            e.preventDefault();
            this.show_shadow();
            this.moved = true;
            clear_selection();
            var px = (e.clientX || e.touches[0].clientX) - this.offset_x;
            var py = (e.clientY || e.touches[0].clientY) - this.offset_y;
            this.shadow.style.left = px + 'px';
            this.shadow.style.top = py + 'px';
        },

        dragend:function(e){
            if(!this.jm.get_editable()){return;}
            if(!this.capture){return;}
            if(this.hlookup_delay != 0){
                $w.clearTimeout(this.hlookup_delay);
                this.hlookup_delay = 0;
                this._lookup_close_node();
            }
            if(this.hlookup_timer != 0){
                $w.clearInterval(this.hlookup_timer);
                this.hlookup_timer = 0;
            }
            if(this.moved){
                var src_node = this.active_node;
                var target_node = this.target_node;
                var target_direct = this.target_direct;
                this.move_node(src_node, target_node, target_direct);
            }
            this.hide_shadow();
            this.moved = false;
            this.capture = false;
        },

        move_node:function(src_node, target_node, target_direct){
            var shadow_h = this.shadow.offsetTop;
            if(!!target_node && !!src_node && !this._is_parent(target_node, src_node)){
                // lookup before_node
                var sibling_nodes = target_node.parent.children;
                var sp = target_node.index;
                var before_node = null;
                var after_node = null;
                if(target_direct == jsMind.direction.bottom){
                    before_node = target_node;
                }else{
                    after_node = target_node;
                }
                this.jm.move_node(src_node.id, target_node.parent.id, before_node?before_node.id:null, after_node?after_node.id:null);
            }
            this.active_node = null;
            this.target_node = null;
            this.target_direct = null;
        },

        jm_event_handle:function(type, data){
            if(type === jsMind.event_type.resize){
                this.resize();
            }
        },

        _is_parent:function(node1, node2){
            if(node1 == null || node2 == null){return false;}
            var n = node2.parent;
            while(!!n){
                if(n.id == node1.id){
                    return true;
                }
                n = n.parent;
            }
            return false;
        }
    };

    var draggable_plugin = new jsMind.plugin('draggable',function(jm){
        var jd = new jsMind.draggable(jm);
        jd.init();
        jm.add_event_listener(function(type, data){
            jd.jm_event_handle.call(jd, type, data);
        });
    });

})(window);