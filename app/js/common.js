$(document).ready(function()
    {
    var flag=false;
    $(".creators-btn").click(function()
        {
            if(flag==true)
            {
                $(".creators").slideUp();
                flag=!flag;
                $(".footer-nav__item--hid").hide();
            }
            else
            {
                $(".creators").slideDown();
                flag=!flag;
                $(".footer-nav__item--hid").show();
            }
    });
});


